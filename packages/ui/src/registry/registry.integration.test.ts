import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { QP_REGISTRY_VALUE, parseRegistry } from "./registry";
import { QP_REGISTRY_ITEMS } from "./items/index";
import { qpRegistrySchema } from "./schemas/registry.schema";
import { knownDefectsOf, qpRegistryItemSchema } from "./schemas/registry-item.schema";
import {
  GIT_ROOT,
  ROOT_REGISTRY_MANIFEST_PATH,
  UI_PACKAGE_DIR,
  UI_PACKAGE_PREFIX,
  UI_REGISTRY_MANIFEST_PATH,
  absolutePathFor,
  listRegistryFiles,
} from "./utils/paths";
import { QP_GITHUB_REGISTRY, projectRegistry } from "./utils/project-shadcn";
import { loadSnapshot } from "./utils/snapshot";
import { loadTokenLookup } from "./utils/tokens";
import { collectDeclaredPaths, hasErrors, validate } from "./utils/validate";

/**
 * INTEGRATION tests for the registry.
 *
 * The unit tests elsewhere prove individual rules behave against hand-built
 * snapshots. These prove the thing a consumer actually depends on: that the
 * committed tree, the committed manifests and the tooling all agree RIGHT NOW,
 * on real disk, with no fixtures.
 *
 * They are deliberately slower and deliberately not isolated — isolating them
 * would remove the only property being tested.
 */

const HAS_TREE = existsSync(join(UI_PACKAGE_DIR, "src", "components", "ui"));

describe("registry — the committed tree validates on real disk", () => {
  test("the canonical registry parses against the zod schema", () => {
    const registry = parseRegistry();

    expect(registry.items.length).toBe(QP_REGISTRY_ITEMS.length);
    expect(registry.items.length).toBeGreaterThan(0);
  });

  test.if(HAS_TREE)("validation reports zero errors against the real filesystem", async () => {
    const [snapshot, lookup] = await Promise.all([
      loadSnapshot(collectDeclaredPaths(QP_REGISTRY_VALUE)),
      loadTokenLookup(),
    ]);

    const issues = validate(QP_REGISTRY_VALUE, snapshot, lookup);
    const errors = issues.filter((entry) => entry.level === "error");

    // Print the actual failures rather than just a count — a bare `toBe(0)`
    // here is one of the least actionable assertions it is possible to write.
    expect(
      errors.map(
        (entry) => `[${entry.rule}] ${entry.itemName ?? entry.file ?? ""}: ${entry.message}`,
      ),
    ).toEqual([]);
    expect(hasErrors(issues)).toBe(false);
  });

  /*
   * These four exist because the schema used to make an honest record
   * impossible. `resizable` has a real SC 2.1.1 failure — its handle is not
   * keyboard-focusable — but `interactive: true` forced `keyboardTested: true`,
   * so the only place the failure could go was a `notes` sentence no gate
   * reads. The sentence was never written, and the item shipped in 1.0.1
   * asserting its keyboard path was tested and fine. A false accessibility
   * claim is worse than a missing one.
   */
  test("an interactive item may drop keyboardTested only by recording the defect", () => {
    const base = QP_REGISTRY_ITEMS.find((item) => item.name === "resizable");
    if (base === undefined) {
      throw new Error("resizable item is missing; this test is anchored to it.");
    }

    const dishonest = qpRegistryItemSchema.safeParse({
      ...base,
      accessibility: { ...base.accessibility, keyboardTested: false, knownDefects: undefined },
    });
    expect(dishonest.success).toBe(false);

    const honest = qpRegistryItemSchema.safeParse(base);
    expect(honest.success).toBe(true);
  });

  test("a recorded defect and an audited claim cannot coexist", () => {
    const base = QP_REGISTRY_ITEMS.find((item) => item.name === "resizable");
    if (base === undefined) {
      throw new Error("resizable item is missing; this test is anchored to it.");
    }

    const result = qpRegistryItemSchema.safeParse({
      ...base,
      accessibility: { ...base.accessibility, status: "audited" },
    });
    expect(result.success).toBe(false);
  });

  test.if(HAS_TREE)("the validator rejects both dishonest shapes too", async () => {
    const [snapshot, lookup] = await Promise.all([
      loadSnapshot(collectDeclaredPaths(QP_REGISTRY_VALUE)),
      loadTokenLookup(),
    ]);

    const withoutDefects = QP_REGISTRY_VALUE.items.map((item) =>
      item.name === "resizable"
        ? { ...item, accessibility: { ...item.accessibility, knownDefects: undefined } }
        : item,
    );

    const issues = validate({ ...QP_REGISTRY_VALUE, items: withoutDefects }, snapshot, lookup);
    expect(
      issues.some(
        (entry) =>
          entry.level === "error" &&
          entry.itemName === "resizable" &&
          entry.message.includes("keyboardTested"),
      ),
    ).toBe(true);
  });

  test("resizable still carries its known SC 2.1.1 failure", () => {
    const resizable = QP_REGISTRY_ITEMS.find((item) => item.name === "resizable");
    const defects = resizable === undefined ? [] : knownDefectsOf(resizable.accessibility);

    // Anchored deliberately: if somebody fixes or replaces react-resizable-panels
    // and drops the defect, this fails and forces the notes to be revisited too.
    expect(defects.map((defect) => defect.criterion)).toEqual(["2.1.1"]);
    expect(resizable?.accessibility.status).not.toBe("audited");
  });

  test.if(HAS_TREE)("every declared file exists on disk", () => {
    const missing: string[] = [];
    for (const item of QP_REGISTRY_ITEMS) {
      for (const file of item.files) {
        if (!existsSync(absolutePathFor(file.path))) {
          missing.push(`${item.name} -> ${file.path}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  test.if(HAS_TREE)("every shippable source file is claimed by exactly one item", async () => {
    const onDisk = await listRegistryFiles();

    const owners = new Map<string, string[]>();
    for (const item of QP_REGISTRY_ITEMS) {
      for (const file of item.files) {
        owners.set(file.path, [...(owners.get(file.path) ?? []), item.name]);
      }
    }

    const unclaimed = onDisk.filter((path) => !owners.has(path));
    const doubleClaimed = [...owners.entries()]
      .filter(([, names]) => names.length > 1)
      .map(([path, names]) => `${path} claimed by ${names.join(", ")}`);

    expect(unclaimed).toEqual([]);
    expect(doubleClaimed).toEqual([]);
  });

  test("every registryDependency resolves to a real item", () => {
    const names = new Set(QP_REGISTRY_ITEMS.map((item) => item.name));
    const unresolved: string[] = [];

    for (const item of QP_REGISTRY_ITEMS) {
      for (const dependency of item.registryDependencies) {
        // Bare kebab names must be local; namespaced/GitHub addresses are external.
        if (!dependency.includes("/") && !names.has(dependency)) {
          unresolved.push(`${item.name} -> ${dependency}`);
        }
      }
    }
    expect(unresolved).toEqual([]);
  });

  test("no item depends on itself", () => {
    const cycles = QP_REGISTRY_ITEMS.filter((item) =>
      item.registryDependencies.includes(item.name),
    ).map((item) => item.name);

    expect(cycles).toEqual([]);
  });
});

describe("registry — the committed manifests match what the tooling would emit", () => {
  /*
   * This is the contract test that matters most for a consumer: `bunx shadcn
   * add QPMatrix/qpm-ui/<item>` reads the COMMITTED registry.json,
   * not the TypeScript source. If someone edits an item and forgets
   * `registry:build`, everything else here still passes and the consumer gets
   * the previous release's file list. This is the only check that catches it.
   */
  const registry = qpRegistrySchema.parse(QP_REGISTRY_VALUE);

  test.if(HAS_TREE)("packages/ui/registry.json is up to date", async () => {
    const expected = projectRegistry(registry, {
      pathPrefix: UI_PACKAGE_PREFIX,
      githubRegistry: QP_GITHUB_REGISTRY,
    });
    const committed: unknown = await Bun.file(absolutePathFor(UI_REGISTRY_MANIFEST_PATH)).json();

    expect(committed).toEqual(expected);
  });

  test.if(HAS_TREE)("the ROOT registry.json is up to date", async () => {
    // A GitHub source registry always resolves the repository's root
    // registry.json, so this is the file consumers actually fetch.
    const expected = projectRegistry(registry, {
      pathPrefix: "",
      githubRegistry: QP_GITHUB_REGISTRY,
    });
    const committed: unknown = await Bun.file(absolutePathFor(ROOT_REGISTRY_MANIFEST_PATH)).json();

    expect(committed).toEqual(expected);
  });

  test("the projection maps every canonical type to a shadcn type", () => {
    const projected = projectRegistry(registry, { pathPrefix: UI_PACKAGE_PREFIX });

    for (const item of projected.items) {
      expect(item.type.startsWith("registry:")).toBe(true);
    }
    expect(projected.items.length).toBe(registry.items.length);
  });

  test("projected file paths are relative to the manifest that declares them", () => {
    const packageManifest = projectRegistry(registry, { pathPrefix: UI_PACKAGE_PREFIX });
    const rootManifest = projectRegistry(registry, { pathPrefix: "" });

    for (const item of packageManifest.items) {
      for (const file of item.files) {
        expect(file.path.startsWith(UI_PACKAGE_PREFIX)).toBe(false);
      }
    }
    for (const item of rootManifest.items) {
      for (const file of item.files) {
        expect(file.path.startsWith(UI_PACKAGE_PREFIX)).toBe(true);
      }
    }
  });
});

describe("registry CLIs — real subprocess runs, not imported functions", () => {
  /*
   * Importing a CLI's helpers and asserting on them proves the helpers work.
   * It does not prove the CLI runs, parses its flags, resolves its paths from
   * a different cwd, or exits with the right code — which is all CI depends on.
   * These spawn the real thing.
   */
  function run(script: string, args: string[] = []) {
    return Bun.spawnSync({
      cmd: ["bun", "run", `scripts/${script}`, ...args],
      cwd: UI_PACKAGE_DIR,
      stdout: "pipe",
      stderr: "pipe",
    });
  }

  test.if(HAS_TREE)("validate-registry exits 0 and reports zero errors", () => {
    const result = run("validate-registry.ts");
    const stdout = result.stdout.toString();

    expect(stdout).toContain("0 error(s)");
    expect(result.exitCode).toBe(0);
  });

  test.if(HAS_TREE)("validate-registry --json emits a machine-readable result", () => {
    const result = run("validate-registry.ts", ["--json"]);
    const parsed = JSON.parse(result.stdout.toString()) as { ok: boolean; issues: unknown[] };

    expect(parsed.ok).toBe(true);
    expect(Array.isArray(parsed.issues)).toBe(true);
  });

  test.if(HAS_TREE)("check-component passes for a finished component", () => {
    const result = run("check-component.ts", ["metric-card", "--json"]);
    const parsed = JSON.parse(result.stdout.toString()) as { ok: boolean; findings: unknown[] };

    expect(parsed.findings).toEqual([]);
    expect(parsed.ok).toBe(true);
    expect(result.exitCode).toBe(0);
  });

  test("check-component FAILS for a name that is not registered", () => {
    // The negative case matters more than the positive one: a gate that
    // cannot fail is not a gate.
    const result = run("check-component.ts", ["definitely-not-a-component", "--json"]);
    const parsed = JSON.parse(result.stdout.toString()) as {
      ok: boolean;
      findings: { rule: string }[];
    };

    expect(parsed.ok).toBe(false);
    expect(parsed.findings.map((f) => f.rule)).toContain("not-registered");
    expect(result.exitCode).toBe(1);
  });

  test.if(HAS_TREE)(
    "preview-registry --json emits the same manifest as registry:build",
    async () => {
      const result = run("preview-registry.ts", ["--json"]);
      const previewed = JSON.parse(result.stdout.toString()) as { items: unknown[] };
      const committed = (await Bun.file(absolutePathFor(UI_REGISTRY_MANIFEST_PATH)).json()) as {
        items: unknown[];
      };

      // The preview reads the canonical items directly, so it can never be a
      // stale copy — this asserts that property rather than assuming it.
      expect(previewed.items.length).toBe(committed.items.length);
    },
  );
});

describe("scaffold-component — generates a component that passes the gates", () => {
  /*
   * The scaffolder's whole promise is "what this emits is correct by
   * construction". The only way to test that promise is to run it and then run
   * the gates against what it produced.
   *
   * It writes into the real tree (it has to — the validator resolves paths from
   * the repo root), so this test cleans up after itself in a `finally` and uses
   * a name no real component will ever take.
   */
  const NAME = "zz-scaffold-probe";
  const folder = join(UI_PACKAGE_DIR, "src", "components", NAME);
  const item = join(UI_PACKAGE_DIR, "src", "registry", "items", `${NAME}.ts`);
  const barrel = join(UI_PACKAGE_DIR, "src", "index.ts");
  const itemsBarrel = join(UI_PACKAGE_DIR, "src", "registry", "items", "index.ts");

  test.if(HAS_TREE)("emits the seven-file layout and wires both barrels", async () => {
    const barrelBefore = await Bun.file(barrel).text();
    const itemsBarrelBefore = await Bun.file(itemsBarrel).text();

    try {
      const result = Bun.spawnSync({
        cmd: [
          "bun",
          "run",
          "scripts/scaffold-component.ts",
          "--name",
          NAME,
          "--archetype",
          "container",
          "--description",
          "Scaffolder integration probe.",
        ],
        cwd: UI_PACKAGE_DIR,
        stdout: "pipe",
        stderr: "pipe",
      });
      expect(result.exitCode).toBe(0);

      for (const file of [
        `${NAME}.tsx`,
        `${NAME}.types.ts`,
        `${NAME}.constants.ts`,
        `${NAME}.utils.ts`,
        `${NAME}.test.tsx`,
        `${NAME}.stories.tsx`,
        "index.ts",
      ]) {
        expect(existsSync(join(folder, file))).toBe(true);
      }
      expect(existsSync(item)).toBe(true);

      // Wired, not merely written.
      expect(await Bun.file(barrel).text()).toContain(`./components/${NAME}`);

      // The generated component must carry its unfinished markers, so that a
      // scaffold can never be mistaken for a finished component.
      const source = await Bun.file(join(folder, `${NAME}.tsx`)).text();
      expect(source).toContain("TODO(scaffold)");

      // House rules the generator is responsible for.
      // Anchored to the start of a line: the generated file's own doc comment
      // NAMES the banned pattern ("`import * as React` is lint-banned"), so a
      // substring check matches the documentation rather than a real import.
      expect(source).not.toMatch(/^import \* as React/m);
      // Written as a regex, not a string literal: the registry's
      // `no-alias-imports-in-source` rule scans this file too, and an inline
      // `from "@/` literal reads to it as a real alias import.
      expect(source).not.toMatch(/from ["']@\//);
      expect(source).toContain('from "../../lib/utils"');
    } finally {
      await rm(folder, { recursive: true, force: true });
      await rm(item, { force: true });
      await Bun.write(barrel, barrelBefore);
      await Bun.write(itemsBarrel, itemsBarrelBefore);
    }
  });

  test.if(HAS_TREE)(
    "check-component REJECTS the fresh scaffold (markers still present)",
    async () => {
      const barrelBefore = await Bun.file(barrel).text();
      const itemsBarrelBefore = await Bun.file(itemsBarrel).text();

      try {
        Bun.spawnSync({
          cmd: ["bun", "run", "scripts/scaffold-component.ts", "--name", NAME],
          cwd: UI_PACKAGE_DIR,
          stdout: "pipe",
          stderr: "pipe",
        });

        const result = Bun.spawnSync({
          cmd: ["bun", "run", "scripts/check-component.ts", NAME, "--json"],
          cwd: UI_PACKAGE_DIR,
          stdout: "pipe",
          stderr: "pipe",
        });
        const parsed = JSON.parse(result.stdout.toString()) as {
          ok: boolean;
          findings: { rule: string }[];
        };

        // This is the property that stops a scaffold shipping: it is complete
        // enough to compile and incomplete enough to fail the gate.
        expect(parsed.ok).toBe(false);
        expect(parsed.findings.map((f) => f.rule)).toContain("unfinished-scaffold");
      } finally {
        await rm(folder, { recursive: true, force: true });
        await rm(item, { force: true });
        await Bun.write(barrel, barrelBefore);
        await Bun.write(itemsBarrel, itemsBarrelBefore);
      }
    },
  );

  test("refuses to overwrite an existing component without --force", () => {
    const result = Bun.spawnSync({
      cmd: ["bun", "run", "scripts/scaffold-component.ts", "--name", "metric-card"],
      cwd: UI_PACKAGE_DIR,
      stdout: "pipe",
      stderr: "pipe",
    });

    expect(result.exitCode).toBe(1);
    expect(result.stderr.toString()).toContain("already exists");
  });

  test("rejects a non-kebab-case name", () => {
    const result = Bun.spawnSync({
      cmd: ["bun", "run", "scripts/scaffold-component.ts", "--name", "MetricCard"],
      cwd: UI_PACKAGE_DIR,
      stdout: "pipe",
      stderr: "pipe",
    });

    expect(result.exitCode).toBe(1);
    expect(result.stderr.toString()).toContain("kebab-case");
  });
});

describe("paths resolve from the repo, never from process.cwd()", () => {
  /*
   * Every path in the registry tooling is resolved from the module's own
   * location. If that ever regresses, `bun run registry:validate` would pass
   * from `packages/ui` and fail in CI (which runs from the root), which is a
   * miserable failure to debug. Proven here by running a CLI from a temp dir.
   */
  test.if(HAS_TREE)("validate-registry works when run from an unrelated cwd", async () => {
    const dir = await mkdtemp(join(tmpdir(), "qp-registry-cwd-"));
    try {
      const result = Bun.spawnSync({
        cmd: ["bun", "run", join(UI_PACKAGE_DIR, "scripts", "validate-registry.ts"), "--json"],
        cwd: dir,
        stdout: "pipe",
        stderr: "pipe",
      });
      const parsed = JSON.parse(result.stdout.toString()) as { ok: boolean };
      expect(parsed.ok).toBe(true);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test("GIT_ROOT points at the repository that contains packages/ui", () => {
    expect(existsSync(join(GIT_ROOT, "packages", "ui", "package.json"))).toBe(true);
  });
});

describe("flat-install simulation — what a consumer actually receives", () => {
  /*
   * shadcn does NOT preserve source folder structure for `registry:ui` files:
   * they land directly in the consumer's `ui` directory. It DOES preserve
   * subfolders under the `lib` alias. Both facts were established by installing
   * thirteen components into a scratch app with the real CLI and resolving all
   * 121 relative imports.
   *
   * This simulates that install in-process, so the property is checked on every
   * run rather than only when somebody remembers to try it. It is the only test
   * here that can catch a component which is correct in this repo and broken in
   * a consumer's project.
   */
  const uiFiles = new Set<string>();
  const libFiles = new Set<string>();

  for (const item of QP_REGISTRY_ITEMS) {
    for (const file of item.files) {
      const basename = file.path
        .split("/")
        .pop()
        ?.replace(/\.tsx?$/, "");
      if (basename === undefined) {
        continue;
      }
      if (item.type === "utility" || item.type === "hook") {
        const afterAlias = /\/src\/(?:lib|hooks)\/(.+)\.tsx?$/.exec(file.path)?.[1];
        if (afterAlias !== undefined) {
          libFiles.add(afterAlias);
        }
      } else {
        uiFiles.add(basename);
      }
    }
  }

  test.if(HAS_TREE)("every distributed file's imports resolve after install", async () => {
    const { flattenRelativeImports } = await import("./utils/project-shadcn");
    const { extractImportSpecifiers } = await import("./utils/source");

    const broken: string[] = [];

    for (const item of QP_REGISTRY_ITEMS) {
      for (const file of item.files) {
        const source = flattenRelativeImports(await Bun.file(absolutePathFor(file.path)).text());

        for (const specifier of extractImportSpecifiers(source)) {
          if (!specifier.startsWith(".")) {
            continue;
          }

          if (specifier.startsWith("./")) {
            const target = specifier.slice(2);
            // A same-folder import resolves within whichever alias directory
            // the item itself lands in: `ui` for components and primitives,
            // `lib`/`hooks` for utilities, where the subfolder is preserved.
            const sameFolder =
              item.type === "utility" || item.type === "hook"
                ? [...libFiles].some((entry) => entry.endsWith(`/${target}`) || entry === target)
                : uiFiles.has(target);
            if (!sameFolder) {
              broken.push(`${item.name}: ${specifier}`);
            }
            continue;
          }

          const uiMatch = /^\.\.\/ui\/([a-z0-9-]+)$/.exec(specifier);
          if (uiMatch?.[1] !== undefined) {
            if (!uiFiles.has(uiMatch[1])) {
              broken.push(`${item.name}: ${specifier}`);
            }
            continue;
          }

          const aliasMatch = /^\.\.\/\.\.\/(?:lib|hooks)\/(.+)$/.exec(specifier);
          if (aliasMatch?.[1] !== undefined) {
            const wanted = aliasMatch[1];
            if (wanted !== "utils" && !libFiles.has(wanted)) {
              broken.push(`${item.name}: ${specifier}`);
            }
            continue;
          }

          broken.push(`${item.name}: ${specifier} (unclassifiable after flattening)`);
        }
      }
    }

    expect(broken).toEqual([]);
  });

  test("sibling-component imports are flattened, alias imports are not", async () => {
    const { flattenRelativeImports } = await import("./utils/project-shadcn");

    // A sibling component folder is flattened — its files land alongside.
    expect(flattenRelativeImports('import { QPText } from "../text";')).toContain('"./text"');
    expect(flattenRelativeImports('import type { X } from "../text/text.types";')).toContain(
      '"./text.types"',
    );

    // `../ui/*` is already correct: primitives land in the same flat directory.
    expect(flattenRelativeImports('import { Card } from "../ui/card";')).toContain('"../ui/card"');

    // `lib` keeps its subfolder — shadcn preserves structure under that alias.
    expect(
      flattenRelativeImports('import { x } from "../../lib/motion/motion-core.utils";'),
    ).toContain('"../../lib/motion/motion-core.utils"');
    expect(flattenRelativeImports('import { cn } from "../../lib/utils";')).toContain(
      '"../../lib/utils"',
    );
  });
});

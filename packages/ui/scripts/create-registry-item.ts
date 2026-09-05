#!/usr/bin/env bun
/**
 * create-registry-item — register something that already exists.
 *
 * `bun run scaffold` writes a component AND its registry item together, which
 * is the normal path. This is for the other three cases:
 *
 *   1. A shadcn primitive was just installed with the shadcn CLI, which knows
 *      nothing about the QPMatrix registry and leaves the item unwritten.
 *   2. A utility or hook needs distributing (`type: utility`, `type: hook`).
 *   3. An item file was lost, or its file list went stale after a rename.
 *
 * It derives everything it can from the source — npm dependencies from real
 * import statements, token dependencies from the Tailwind classes actually
 * written — so the item starts out matching the tree instead of matching
 * someone's memory of it. The parts a machine cannot know (the description,
 * the accessibility posture) are left as explicit TODOs that
 * `registry:check` refuses to pass.
 *
 * Usage:
 *   bun run registry:create -- --name switch --type primitive \
 *     --files packages/ui/src/components/ui/switch.tsx
 *
 *   bun run registry:create -- --name metric-card --type component --from-folder
 *   bun run registry:create -- --name switch --type primitive --files … --dry-run
 */

import { existsSync } from "node:fs";
import { join } from "node:path";

import { Glob } from "bun";

import {
  KEBAB_CASE_PATTERN,
  QP_ITEM_TYPES,
  qpRegistryItemSchema,
  type QpItemType,
} from "../src/registry/schemas/registry-item.schema";
import { QP_REGISTRY_ITEMS } from "../src/registry/items/index";
import { UI_PACKAGE_DIR, absolutePathFor, isTestFile, toPosix } from "../src/registry/utils/paths";
import { extractImportSpecifiers, packageNameOf } from "../src/registry/utils/source";
import { extractTokenDependencies, loadTokenLookup } from "../src/registry/utils/tokens";

const ITEMS_DIR = join(UI_PACKAGE_DIR, "src", "registry", "items");

function fail(message: string): never {
  console.error(`create-registry-item: ${message}`);
  process.exit(1);
}

const argv = process.argv.slice(2);

function flag(key: string): string | undefined {
  const index = argv.indexOf(`--${key}`);
  if (index === -1) {
    return undefined;
  }
  const value = argv[index + 1];
  return value === undefined || value.startsWith("--") ? undefined : value;
}

const name = flag("name");
if (name === undefined || !KEBAB_CASE_PATTERN.test(name)) {
  fail("--name is required and must be kebab-case.");
}

const typeInput = flag("type") ?? "component";
if (!(QP_ITEM_TYPES as readonly string[]).includes(typeInput)) {
  fail(`--type must be one of ${QP_ITEM_TYPES.join(", ")} (got "${typeInput}").`);
}
const type = typeInput as QpItemType;

const dryRun = argv.includes("--dry-run");
const force = argv.includes("--force");

const existing = QP_REGISTRY_ITEMS.find((entry) => entry.name === name);
if (existing !== undefined && !force) {
  fail(
    `An item named "${name}" is already registered. Edit src/registry/items/${name}.ts directly, or pass --force to regenerate it.`,
  );
}

/* -------------------------------------------------------------------- */
/* Which files does this item ship?                                     */
/* -------------------------------------------------------------------- */

let files: string[];

if (argv.includes("--from-folder")) {
  // The QPMatrix component layout: everything in the folder except the proofs.
  const folder = join(UI_PACKAGE_DIR, "src", "components", name);
  if (!existsSync(folder)) {
    fail(`--from-folder given but packages/ui/src/components/${name}/ does not exist.`);
  }
  const found: string[] = [];
  for await (const rel of new Glob("*.{ts,tsx}").scan(folder)) {
    const path = `packages/ui/src/components/${name}/${toPosix(rel)}`;
    if (!isTestFile(path)) {
      found.push(path);
    }
  }
  files = found.sort();
} else {
  const raw = flag("files");
  if (raw === undefined) {
    fail(
      "Pass --files <comma-separated repo-root-relative paths>, or --from-folder for a component folder.",
    );
  }
  files = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .sort();
}

if (files.length === 0) {
  fail("No files resolved. An item must ship at least one file.");
}

for (const file of files) {
  if (!existsSync(absolutePathFor(file))) {
    fail(`Declared file does not exist: ${file}`);
  }
}

/* -------------------------------------------------------------------- */
/* Derive dependencies from what the source actually imports and uses.  */
/* -------------------------------------------------------------------- */

const lookup = await loadTokenLookup();
const localItemNames = new Set(QP_REGISTRY_ITEMS.map((entry) => entry.name));

const npmDependencies = new Set<string>();
const registryDependencies = new Set<string>();
const tokenDependencies = new Set<string>();

for (const file of files) {
  const source = await Bun.file(absolutePathFor(file)).text();

  for (const specifier of extractImportSpecifiers(source)) {
    if (specifier.startsWith(".")) {
      // A relative import inside the package is a REGISTRY dependency: the
      // consumer needs that item installed too. `../ui/button` -> `button`,
      // `../../lib/utils` -> `cn` (the item that ships utils.ts).
      const base = specifier.split("/").pop() ?? "";
      const candidate = base === "utils" ? "cn" : base.replace(/\.[jt]sx?$/, "");
      if (localItemNames.has(candidate) && candidate !== name) {
        registryDependencies.add(candidate);
      }
      continue;
    }
    // react/react-dom are peer dependencies of the package, never item deps.
    const packageName = packageNameOf(specifier);
    if (packageName !== null && packageName !== "react" && packageName !== "react-dom") {
      npmDependencies.add(packageName);
    }
  }

  for (const token of extractTokenDependencies(source, lookup)) {
    tokenDependencies.add(token);
  }
}

/* -------------------------------------------------------------------- */

const camel = name
  .split("-")
  .map((part, index) => (index === 0 ? part : `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`))
  .join("");
// `switch` is a reserved word; the item's `name` field stays "switch".
const binding = camel === "switch" ? "switchItem" : camel;

const interactive = type === "component" || type === "primitive" || type === "form-pattern";

const draft = {
  name,
  type,
  description: `TODO(scaffold): one sentence describing ${name}.`,
  version: "0.1.0",
  files: files.map((path) => ({ path })),
  dependencies: [...npmDependencies].sort(),
  registryDependencies: [...registryDependencies].sort(),
  aliases:
    type === "utility" || type === "hook"
      ? { lib: "@/lib", utils: "@/lib/utils" }
      : { components: "@/components", ui: "@/components/ui", utils: "@/lib/utils" },
  tokenDependencies: [...tokenDependencies].sort(),
  accessibility: {
    status: "partial" as const,
    wcagLevel: "2.2-AA" as const,
    interactive,
    keyboardTested: interactive,
    focusManaged: false,
    notes: "TODO(scaffold): what was audited, and what was not.",
  },
  supportedPlatforms: ["web" as const],
  tags: [] as string[],
};

/*
 * Validate the DRAFT before writing it. The generated file is TypeScript
 * annotated `: QpRegistryItem`, so a shape error would surface at the next
 * typecheck — but the schema catches things the type cannot (bad semver, a
 * non-kebab name, an interactive item that does not claim keyboard testing),
 * and catching them here means never committing an item that `registry:validate`
 * will immediately reject.
 */
const parsed = qpRegistryItemSchema.safeParse(draft);
if (!parsed.success) {
  console.error("create-registry-item: the derived item failed schema validation:\n");
  const { z } = await import("zod");
  console.error(z.prettifyError(parsed.error));
  process.exit(1);
}

function literal(value: unknown, indent = 2): string {
  return JSON.stringify(value, null, indent)
    .split("\n")
    .map((line, index) => (index === 0 ? line : `  ${line}`))
    .join("\n");
}

const source = `import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** ${draft.description} */
export const ${binding}: QpRegistryItem = ${literal(draft)};
`;

if (dryRun) {
  console.log(source);
  process.exit(0);
}

const target = join(ITEMS_DIR, `${name}.ts`);
await Bun.write(target, source);

console.log(`  created  packages/ui/src/registry/items/${name}.ts`);
console.log(`    files        ${String(files.length)}`);
console.log(`    npm deps     ${draft.dependencies.join(", ") || "(none)"}`);
console.log(`    registry     ${draft.registryDependencies.join(", ") || "(none)"}`);
console.log(`    tokens       ${String(draft.tokenDependencies.length)}`);
console.log(`
Next:
  1. Add \`${binding}\` to src/registry/items/index.ts (both the array and the re-export).
  2. Replace every TODO(scaffold) — especially the accessibility notes.
  3. bun run registry:check ${name}
  4. bun run registry:build
`);

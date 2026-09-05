#!/usr/bin/env bun
/**
 * scaffold-component — generate a standards-compliant component folder.
 *
 * Writing a @qpmatrix/ui component by hand means re-deriving the same eight
 * decisions every time: folder shape, barrel wiring, named React imports,
 * relative-import rule, cva + token roles, the mandatory test contract, a
 * Storybook preview, and a registry item. Every one of those is mechanical and
 * every one of them is a gate the validator will fail you on later. This script
 * emits all of it correctly-by-construction so the author only writes the part
 * that is actually the component.
 *
 * What it generates, for `--name status-pill`:
 *
 *   packages/ui/src/components/status-pill/status-pill.tsx          markup only
 *   packages/ui/src/components/status-pill/status-pill.types.ts     props + unions
 *   packages/ui/src/components/status-pill/status-pill.constants.ts cva + fixed values
 *   packages/ui/src/components/status-pill/status-pill.utils.ts     pure helpers
 *   packages/ui/src/components/status-pill/status-pill.test.tsx     the contract suite
 *   packages/ui/src/components/status-pill/status-pill.stories.tsx  the preview
 *   packages/ui/src/components/status-pill/index.ts                 barrel
 *   packages/ui/src/registry/items/status-pill.ts                   registry item
 *
 * and rewires `src/index.ts` + `src/registry/items/index.ts`.
 *
 * The four-way split is the house layout, not a preference: markup, types,
 * constants and logic each change for different reasons and are read by
 * different people. A single 300-line `.tsx` mixing a cva map, a props
 * interface and a keyboard predicate is the thing this replaces.
 *
 * The generated files are a STARTING POINT, not a finished component: they
 * carry `TODO(scaffold)` markers. `bun run registry:check <name>` refuses to
 * pass while any marker remains, so a scaffold can never be shipped unfinished.
 *
 * Usage:
 *   bun run scaffold -- --name status-pill --archetype passthrough \
 *     --primitive badge --description "Status chip with a token-role tone."
 *
 *   bun run scaffold -- --name status-pill --dry-run    # print, write nothing
 *   bun run scaffold -- --list                          # archetypes + primitives
 *
 * Flags:
 *   --name         REQUIRED. kebab-case component name.
 *   --archetype    passthrough | container | form | data. Default: container.
 *   --primitive    ./ui/* file to compose (required for passthrough/data).
 *   --description  One sentence for the doc comment and the registry item.
 *   --tags         Comma-separated registry tags.
 *   --interactive  Force the interactive test block on (archetype implies it).
 *   --dry-run      Print every file to stdout; touch nothing.
 *   --force        Overwrite an existing component folder.
 *   --fill         Only write files that are MISSING from an existing folder.
 *   --list         Print the archetype and primitive catalogue, then exit.
 *
 * `--fill` is the mode for a component that was written before the house
 * layout settled, or by hand. It never touches a file that exists, so the
 * component's real implementation is safe; it just adds the `.types.ts`,
 * `.constants.ts`, `.utils.ts`, `.test.tsx`, `.stories.tsx` or `index.ts` that
 * are absent. Every generated file still carries its TODO(scaffold) markers,
 * so `registry:check` keeps failing until they are actually written.
 *
 *   bun run scaffold -- --name section --fill
 *   bun run scaffold -- --fill-all          # every component folder at once
 */

import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";

import { Glob } from "bun";

const SCRIPTS_DIR = import.meta.dir;
const UI_DIR = resolve(SCRIPTS_DIR, "..");
const TEMPLATES_DIR = join(SCRIPTS_DIR, "templates");
const COMPONENTS_DIR = join(UI_DIR, "src", "components");
const PRIMITIVES_DIR = join(COMPONENTS_DIR, "ui");
const ITEMS_DIR = join(UI_DIR, "src", "registry", "items");
const BARREL_PATH = join(UI_DIR, "src", "index.ts");
const ITEMS_BARREL_PATH = join(ITEMS_DIR, "index.ts");

/**
 * The four shapes every QPMatrix component has taken so far. The archetype
 * decides the root element, which props base the interface extends, and which
 * accessibility cases the generated test suite starts with — i.e. it encodes
 * the *reason* the choices differ, so an author is not asked to re-litigate
 * them per component.
 */
const ARCHETYPES = {
  /**
   * Wraps exactly one primitive and adds a variant axis. All behaviour —
   * focus ring, disabled semantics, `render`/`nativeButton` composition, ref
   * forwarding — is inherited. Reference: src/components/icon-button.
   */
  passthrough: {
    description: "Wraps one ./ui/* primitive and adds a variant axis.",
    requiresPrimitive: true,
    interactive: true,
    useClient: false,
    baseClasses: "",
  },
  /**
   * Owns a plain root element and arranges children. No form state, no focus
   * management of its own. Reference: src/components/message-bubble.
   */
  container: {
    description: "Owns a plain element and arranges props-supplied content.",
    requiresPrimitive: false,
    interactive: false,
    useClient: false,
    baseClasses: "flex items-center",
  },
  /**
   * Collects user input. Gets controlled/uncontrolled state, a real <form>,
   * label wiring and error/hint description. Reference: src/components/composer.
   */
  form: {
    description: "Collects user input; controlled/uncontrolled with label + error wiring.",
    requiresPrimitive: false,
    interactive: true,
    useClient: true,
    baseClasses: "flex w-full flex-col gap-2",
  },
  /**
   * Displays a value inside a surface primitive. Reference: src/components/metric-card.
   */
  data: {
    description: "Displays values inside a surface primitive (usually Card).",
    requiresPrimitive: true,
    interactive: false,
    useClient: false,
    baseClasses: "",
  },
} as const satisfies Record<
  string,
  {
    description: string;
    requiresPrimitive: boolean;
    interactive: boolean;
    useClient: boolean;
    baseClasses: string;
  }
>;

type Archetype = keyof typeof ARCHETYPES;

const KEBAB_CASE_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

interface Options {
  name: string;
  archetype: Archetype;
  primitive: string | null;
  description: string;
  tags: string[];
  interactive: boolean;
  dryRun: boolean;
  force: boolean;
  /** Only write files that do not already exist. */
  fill: boolean;
}

function fail(message: string): never {
  console.error(`scaffold-component: ${message}`);
  process.exit(1);
}

function toPascal(kebab: string): string {
  return kebab
    .split("-")
    .map((part) => (part.length === 0 ? part : `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`))
    .join("");
}

function toCamel(kebab: string): string {
  const pascal = toPascal(kebab);
  return `${pascal[0]?.toLowerCase() ?? ""}${pascal.slice(1)}`;
}

function toTitle(kebab: string): string {
  return kebab
    .split("-")
    .map((part) => (part.length === 0 ? part : `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`))
    .join(" ");
}

/**
 * The exported symbols of a `./ui/*` primitive file, read from its `export {}`
 * statement. Used both to validate `--primitive` and to print the catalogue, so
 * the two can never disagree with what is actually on disk.
 */
async function readPrimitiveExports(file: string): Promise<string[]> {
  const source = await Bun.file(join(PRIMITIVES_DIR, file)).text();
  const match = /export\s*\{([^}]*)\}/.exec(source);
  if (match?.[1] === undefined) {
    return [];
  }
  return match[1]
    .split(",")
    .map(
      (entry) =>
        entry
          .trim()
          .split(/\s+as\s+/)
          .pop()
          ?.trim() ?? "",
    )
    .filter((entry) => entry.length > 0 && !entry.startsWith("type "));
}

async function listPrimitives(): Promise<Map<string, string[]>> {
  const result = new Map<string, string[]>();
  const files: string[] = [];
  for await (const file of new Glob("*.tsx").scan(PRIMITIVES_DIR)) {
    files.push(file);
  }
  files.sort();
  for (const file of files) {
    result.set(basename(file, ".tsx"), await readPrimitiveExports(file));
  }
  return result;
}

function parseArgs(argv: string[]): Options | "list" | "fill-all" {
  const flags = new Map<string, string>();
  const bare = new Set<string>();

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === undefined || !token.startsWith("--")) {
      continue;
    }
    const key = token.slice(2);
    const next = argv[index + 1];
    if (next === undefined || next.startsWith("--")) {
      bare.add(key);
    } else {
      flags.set(key, next);
      index += 1;
    }
  }

  if (bare.has("list")) {
    return "list";
  }
  if (bare.has("fill-all")) {
    return "fill-all";
  }

  const name = flags.get("name");
  if (name === undefined) {
    fail("--name is required. Run with --list to see archetypes and primitives.");
  }
  if (!KEBAB_CASE_PATTERN.test(name)) {
    fail(`--name must be kebab-case (got "${name}").`);
  }

  const archetypeInput = flags.get("archetype") ?? "container";
  if (!(archetypeInput in ARCHETYPES)) {
    fail(
      `--archetype must be one of ${Object.keys(ARCHETYPES).join(", ")} (got "${archetypeInput}").`,
    );
  }
  const archetype = archetypeInput as Archetype;

  const tagsInput = flags.get("tags");

  return {
    name,
    archetype,
    primitive: flags.get("primitive") ?? null,
    description: flags.get("description") ?? `TODO(scaffold): describe ${toTitle(name)}.`,
    tags:
      tagsInput === undefined
        ? []
        : tagsInput
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0),
    interactive: bare.has("interactive") || ARCHETYPES[archetype].interactive,
    dryRun: bare.has("dry-run"),
    force: bare.has("force"),
    fill: bare.has("fill"),
  };
}

/**
 * The interactive block appended to the generated test suite. Split out of the
 * template because a non-interactive component must NOT carry keyboard tests
 * it cannot satisfy — an always-skipped test is worse than an absent one.
 */
const INTERACTIVE_TESTS = `test("is reachable and operable by keyboard alone (WCAG 2.2 SC 2.1.1)", async () => {
    const user = await setupUser();
    const onActivate = mock<() => void>();
    const { getByRole } = render(
      // TODO(scaffold): render the interactive shape and wire the handler.
      <__COMPONENT_NAME__ label="Activate" onClick={onActivate} />,
    );

    const control = getByRole("button", { name: "Activate" });
    await user.tab();
    expect(control).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  test("focus is visible, and never removed without a replacement", () => {
    const { container } = render(<__COMPONENT_NAME__ label="Focusable" />);

    const root = container.querySelector('[data-slot="__COMPONENT_KEBAB__"]');
    // Either the primitive's ring, or the global :focus-visible outline from
    // styles/qpmatrix.css. What is NOT allowed is outline-none with no ring.
    expect(root?.className).not.toContain("focus-visible:outline-none");
  });

  test("does not introduce a positive tabindex (WCAG 2.2 SC 2.4.3)", async () => {
    const { expectNoPositiveTabIndex } = await import("../../testing/a11y");
    const { container } = render(<__COMPONENT_NAME__ label="Order" />);

    expectNoPositiveTabIndex(container);
  });

  `;

interface GeneratedFile {
  path: string;
  contents: string;
}

async function renderTemplate(templateName: string, tokens: Record<string, string>) {
  const raw = await Bun.file(join(TEMPLATES_DIR, templateName)).text();
  return Object.entries(tokens).reduce((acc, [key, value]) => acc.replaceAll(key, value), raw);
}

function registryItemSource(options: Options, componentCamel: string): string {
  const kebab = options.name;
  const primitiveDependency = options.primitive === null ? [] : [`    "${options.primitive}",`];

  return `import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** ${options.description} */
export const ${componentCamel}: QpRegistryItem = {
  name: "${kebab}",
  type: "component",
  description: ${JSON.stringify(options.description)},
  version: "0.1.0",
  files: [
    { path: "packages/ui/src/components/${kebab}/${kebab}.tsx" },
    { path: "packages/ui/src/components/${kebab}/${kebab}.types.ts" },
    { path: "packages/ui/src/components/${kebab}/${kebab}.constants.ts" },
    { path: "packages/ui/src/components/${kebab}/${kebab}.utils.ts" },
    { path: "packages/ui/src/components/${kebab}/index.ts" },
  ],
  // TODO(scaffold): every npm specifier the component's files import at
  // runtime. \`registry:validate\` recomputes this from source and fails on drift.
  dependencies: ["class-variance-authority"],
  registryDependencies: [
    "cn",
${primitiveDependency.join("\n")}
  ],
  aliases: {
    components: "@/components",
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  // TODO(scaffold): @qpmatrix/tokens custom-property names WITHOUT the leading
  // \`--\`. \`registry:validate\` recomputes these from the Tailwind classes in
  // source; run it and paste what it reports.
  tokenDependencies: [],
  accessibility: {
    // TODO(scaffold): flip to "audited" only once bun run a11y:audit passes for
    // this component AND the keyboard model has a test. Lying here is the one
    // thing the validator cannot catch for you.
    status: "partial",
    wcagLevel: "2.2-AA",
    interactive: ${String(options.interactive)},
    keyboardTested: ${String(options.interactive)},
    focusManaged: false,
    notes: "TODO(scaffold): what was audited, and what was not.",
  },
  supportedPlatforms: ["web"],
  tags: ${JSON.stringify(options.tags)},
};
`;
}

/**
 * Insert `line` into an alphabetically sorted run of similar lines. Barrel
 * files are kept sorted so two scaffolds on two branches conflict textually
 * rather than merging into a duplicate export.
 */
function insertSorted(source: string, line: string, matcher: RegExp): string {
  if (source.includes(line)) {
    return source;
  }
  const lines = source.split("\n");
  const indices = lines
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => matcher.test(entry));

  const target = indices.find(({ entry }) => entry.localeCompare(line) > 0);
  const insertAt = target?.index ?? (indices.at(-1)?.index ?? -1) + 1;
  if (insertAt <= 0) {
    return source;
  }
  lines.splice(insertAt, 0, line);
  return lines.join("\n");
}

/**
 * Regenerate `src/registry/items/index.ts` from what is on disk.
 *
 * The previous implementation spliced a new line into the existing file with a
 * sorted insert. It failed SILENTLY the moment the barrel's formatting changed
 * — the item file was written, the barrel was left untouched, and the component
 * looked registered while `QP_REGISTRY_ITEMS` did not contain it. The
 * integration suite caught exactly that.
 *
 * Regenerating removes the failure mode entirely: the barrel is a pure function
 * of the directory, so it cannot drift from it. The exported binding is READ
 * from each item file rather than derived from its name, which is what keeps
 * `switch.ts` (whose binding must be `switchItem`, since `switch` is a reserved
 * word) correct without a special case here.
 */
async function regenerateItemsBarrel(): Promise<number> {
  const names: string[] = [];
  for await (const entry of new Glob("*.ts").scan(ITEMS_DIR)) {
    if (entry !== "index.ts") {
      names.push(entry.replace(/\.ts$/, ""));
    }
  }

  const entries: { file: string; binding: string }[] = [];
  for (const name of names.sort()) {
    const source = await Bun.file(join(ITEMS_DIR, `${name}.ts`)).text();
    const binding = /export const (\w+): QpRegistryItem/.exec(source)?.[1];
    if (binding === undefined) {
      fail(`src/registry/items/${name}.ts has no \`export const <name>: QpRegistryItem\`.`);
    }
    entries.push({ file: name, binding });
  }

  entries.sort((a, b) => a.binding.localeCompare(b.binding));

  const imports = entries
    .map(({ file, binding }) => `import { ${binding} } from "./${file}";`)
    .join("\n");
  const list = entries.map(({ binding }) => `  ${binding},`).join("\n");

  await Bun.write(
    ITEMS_BARREL_PATH,
    `import { type QpRegistryItem } from "../schemas/registry-item.schema";
${imports}

/**
 * Every item @qpmatrix/ui distributes, listed EXPLICITLY.
 *
 * Generated by \`bun run scaffold\` from the contents of this directory. It is
 * deliberately not a runtime glob: the registry manifests are generated from
 * this array, and a glob would make their contents depend on directory-read
 * order and on files that happen to be lying around.
 *
 * \`switchItem\` is the one binding whose name does not match its item name:
 * \`switch\` is a reserved word and cannot be a JavaScript binding. The item's
 * \`name\` field is still \`"switch"\`, which is what consumers install.
 */
export const QP_REGISTRY_ITEMS: readonly QpRegistryItem[] = [
${list}
];

export {
${list}
};
`,
  );

  return entries.length;
}

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv.slice(2));

  if (parsed === "list") {
    console.log("Archetypes:");
    for (const [key, value] of Object.entries(ARCHETYPES)) {
      console.log(`  ${key.padEnd(12)} ${value.description}`);
    }
    console.log("\nPrimitives available to compose (--primitive <file>):");
    for (const [file, exports] of await listPrimitives()) {
      console.log(`  ${file.padEnd(14)} ${exports.join(", ")}`);
    }
    return;
  }

  if (parsed === "fill-all") {
    // Every component folder, filled in one pass. This is the migration path
    // for a tree that predates the house layout: nothing existing is touched,
    // only the absent files are added.
    const folders: string[] = [];
    for await (const entry of new Glob("*/").scan({ cwd: COMPONENTS_DIR, onlyFiles: false })) {
      const clean = entry.replace(/\/$/, "");
      // `ui/` holds the shadcn primitives, which are flat files the CLI owns.
      if (clean !== "ui" && clean !== "") {
        folders.push(clean);
      }
    }
    folders.sort();

    for (const componentName of folders) {
      await run({
        name: componentName,
        archetype: "container",
        primitive: null,
        description: `TODO(scaffold): describe ${toTitle(componentName)}.`,
        tags: [],
        interactive: false,
        dryRun: false,
        force: false,
        fill: true,
      });
    }
    return;
  }

  await run(parsed);
}

async function run(options: Options): Promise<void> {
  const spec = ARCHETYPES[options.archetype];

  if (spec.requiresPrimitive && options.primitive === null) {
    fail(
      `--archetype ${options.archetype} composes a primitive; pass --primitive <file>. ` +
        "Run with --list to see what is available.",
    );
  }

  if (options.primitive !== null && !existsSync(join(PRIMITIVES_DIR, `${options.primitive}.tsx`))) {
    fail(
      `--primitive "${options.primitive}" does not exist under src/components/ui. ` +
        "Add the primitive with the shadcn CLI first (see .agents/skills/shadcn).",
    );
  }

  const kebab = options.name;
  const pascal = toPascal(kebab);
  const camel = toCamel(kebab);
  const folder = join(COMPONENTS_DIR, kebab);

  if (options.fill && !existsSync(folder)) {
    fail(
      `--fill given but packages/ui/src/components/${kebab}/ does not exist. Scaffold it first.`,
    );
  }

  if (existsSync(folder) && !options.force && !options.fill) {
    fail(`src/components/${kebab}/ already exists. Pass --force to overwrite.`);
  }

  const primitiveExports =
    options.primitive === null ? [] : await readPrimitiveExports(`${options.primitive}.tsx`);
  const primitiveSymbol = primitiveExports[0] ?? null;

  const primitiveImport =
    options.primitive === null || primitiveSymbol === null
      ? ""
      : `import { ${primitiveSymbol} } from "../ui/${options.primitive}";\n`;

  // Every public identifier is QP-prefixed; see the "QP prefix" section of
  // src/index.ts for why the shadcn primitives are the one exception. The
  // registry item's own binding (`camel`) stays unprefixed — it is tooling
  // data, not part of the package's public API.
  const tokens: Record<string, string> = {
    __COMPONENT_NAME__: `QP${pascal}`,
    __COMPONENT_CAMEL__: `qp${pascal}`,
    __COMPONENT_RESOLVER__: `qpResolve${pascal}BusyLabel`,
    __COMPONENT_CONST__: `QP_${kebab.toUpperCase().replaceAll("-", "_")}_`,
    __COMPONENT_KEBAB__: kebab,
    __COMPONENT_TITLE__: toTitle(kebab),
    __DESCRIPTION__: options.description,
    __USE_CLIENT__: spec.useClient ? '"use client";\n\n' : "",
    __PRIMITIVE_IMPORT__: primitiveImport,
    __PRIMITIVE_TYPE_IMPORT__:
      options.primitive === null || primitiveSymbol === null
        ? ""
        : `import type { ${primitiveSymbol} } from "../ui/${options.primitive}";\n`,
    __PROPS_BASE__:
      primitiveSymbol === null
        ? 'ComponentProps<"div">'
        : `ComponentProps<typeof ${primitiveSymbol}>`,
    __ROOT_OPEN__: primitiveSymbol ?? "div",
    __ROOT_CLOSE__: primitiveSymbol ?? "div",
    __BASE_CLASSES__: spec.baseClasses,
    __INTERACTIVE_TESTS__: options.interactive
      ? INTERACTIVE_TESTS.replaceAll("__COMPONENT_NAME__", pascal).replaceAll(
          "__COMPONENT_KEBAB__",
          kebab,
        )
      : "",
  };

  const files: GeneratedFile[] = [
    {
      path: join(folder, `${kebab}.tsx`),
      contents: await renderTemplate("component.tsx.template", tokens),
    },
    {
      path: join(folder, `${kebab}.types.ts`),
      contents: await renderTemplate("component.types.ts.template", tokens),
    },
    {
      path: join(folder, `${kebab}.constants.ts`),
      contents: await renderTemplate("component.constants.ts.template", tokens),
    },
    {
      path: join(folder, `${kebab}.utils.ts`),
      contents: await renderTemplate("component.utils.ts.template", tokens),
    },
    {
      path: join(folder, `${kebab}.test.tsx`),
      contents: await renderTemplate("component.test.tsx.template", tokens),
    },
    {
      path: join(folder, `${kebab}.stories.tsx`),
      contents: await renderTemplate("component.stories.tsx.template", tokens),
    },
    {
      path: join(folder, "index.ts"),
      contents: await renderTemplate("index.ts.template", tokens),
    },
    {
      path: join(ITEMS_DIR, `${kebab}.ts`),
      contents: registryItemSource(options, camel),
    },
  ];

  if (options.dryRun) {
    for (const file of files) {
      console.log(`\n===== ${file.path.replace(`${UI_DIR}/`, "packages/ui/")} =====`);
      console.log(file.contents);
    }
    console.log(`\n(dry run — nothing written)`);
    return;
  }

  await mkdir(folder, { recursive: true });

  /*
   * In fill mode an existing file is NEVER overwritten. That is the whole
   * safety property: a hand-written component keeps its implementation and
   * only gains the files the house layout says it is missing. A `.tsx` that
   * exists as `.tsx` OR as a sibling with the other JSX extension counts as
   * present — `prose.utils.tsx` satisfies the `prose.utils.ts` requirement.
   */
  const written: GeneratedFile[] = [];
  for (const file of files) {
    if (options.fill) {
      const alternate = file.path.endsWith(".ts")
        ? `${file.path}x`
        : file.path.replace(/\.tsx$/, ".ts");
      if (existsSync(file.path) || existsSync(alternate)) {
        continue;
      }
    }
    await mkdir(dirname(file.path), { recursive: true });
    await Bun.write(file.path, file.contents);
    written.push(file);
  }

  if (options.fill && written.length === 0) {
    console.log(`  ${kebab}: already complete.`);
    return;
  }

  const barrel = await Bun.file(BARREL_PATH).text();
  await Bun.write(
    BARREL_PATH,
    insertSorted(
      barrel,
      `export * from "./components/${kebab}";`,
      /^export \* from "\.\/components\/(?!ui\/)/,
    ),
  );

  const itemCount = await regenerateItemsBarrel();

  for (const file of written.length > 0 ? written : files) {
    console.log(`  created  ${file.path.replace(`${UI_DIR}/`, "packages/ui/")}`);
  }
  console.log(`  wired    packages/ui/src/index.ts`);
  console.log(`  wired    packages/ui/src/registry/items/index.ts (${String(itemCount)} items)`);
  console.log(`
Next:
  1. Write the component. Delete every TODO(scaffold) marker.
  2. bun run --filter @qpmatrix/ui test          # the contract suite must pass
  3. bun run --filter @qpmatrix/ui storybook     # preview it, check the a11y panel
  4. bun run --filter @qpmatrix/ui registry:check ${kebab}
  5. bun run --filter @qpmatrix/ui registry:build
`);
}

await main();

import { z } from "zod";

import {
  ALIAS_PREFIX,
  type QpRegistryItem,
  qpRegistryItemSchema,
} from "../schemas/registry-item.schema";
import { qpRegistryEnvelopeSchema } from "../schemas/registry.schema";
import { compareStrings } from "./project-shadcn";
import { type RegistrySnapshot } from "./snapshot";
import {
  extractImportSpecifiers,
  findAliasImports,
  findHardcodedColors,
  packageNameOf,
} from "./source";
import { extractTokenDependencies, type TokenLookup } from "./tokens";

/**
 * The registry validator: one pure function, one issue list, one rule name per
 * failure mode.
 *
 * Every rule below encodes something that has actually broken (or would break)
 * a consumer: a file that ships but does not exist, a component that never made
 * it into the registry, a `@/` import that survives `tsc` emit, a hex colour
 * that ignores the token system. `scripts/validate-registry.ts` is a thin CLI
 * over this; `scripts/check-component.ts` reuses the same rules for one item.
 */

export const VALIDATION_RULES = [
  "schema",
  "duplicate-name",
  "missing-file",
  "unclaimed-file",
  "unresolved-registry-dependency",
  "invalid-alias",
  "no-alias-imports-in-source",
  "banned-dependency",
  "hardcoded-color",
  "unknown-token",
  "missing-accessibility",
  "incomplete-token-dependencies",
  "colliding-install-path",
  "unresolvable-flat-import",
  "undeclared-registry-dependency",
] as const;

export type ValidationRule = (typeof VALIDATION_RULES)[number];

export type ValidationLevel = "error" | "warning";

export interface ValidationIssue {
  readonly level: ValidationLevel;
  readonly rule: ValidationRule;
  readonly itemName?: string;
  readonly file?: string;
  readonly message: string;
}

/** Dependency scopes @qpmatrix/ui may never take (ADR-005: the MUI era is over). */
export const BANNED_DEPENDENCY_SCOPES: readonly string[] = ["@mui/", "@emotion/"];

/** `@scope/name` or `@scope/name/sub-item` — a configured-registry address. */
const NAMESPACE_ADDRESS = /^@[a-z0-9][a-z0-9-]*\/[a-z0-9][a-z0-9-]*(\/[a-z0-9][a-z0-9-]*)*$/;
/** `owner/repo/item` or `owner/repo/nested/item#ref` — a GitHub source registry. */
const GITHUB_ADDRESS = /^[A-Za-z0-9][\w.-]*\/[A-Za-z0-9][\w.-]*(\/[A-Za-z0-9][\w.-]*)+(#[^\s]+)?$/;
/** A bare kebab name — an official shadcn item. */
const SHADCN_BARE_NAME = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

interface IssueLocation {
  readonly itemName?: string;
  readonly file?: string;
}

function issue(
  level: ValidationLevel,
  rule: ValidationRule,
  message: string,
  location: IssueLocation = {},
): ValidationIssue {
  return {
    level,
    rule,
    message,
    ...(location.itemName === undefined ? {} : { itemName: location.itemName }),
    ...(location.file === undefined ? {} : { file: location.file }),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function rawName(value: unknown): string | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  return typeof value.name === "string" ? value.name : undefined;
}

/**
 * Every file path declared anywhere in a (possibly malformed) registry value.
 * The CLI uses this to decide which files the snapshot must read, before the
 * registry has been proven valid.
 */
export function collectDeclaredPaths(registry: unknown): string[] {
  if (!isRecord(registry) || !Array.isArray(registry.items)) {
    return [];
  }
  const paths = new Set<string>();
  for (const item of registry.items) {
    if (!isRecord(item) || !Array.isArray(item.files)) {
      continue;
    }
    for (const file of item.files) {
      if (isRecord(file) && typeof file.path === "string") {
        paths.add(file.path);
      }
    }
  }
  return [...paths].sort();
}

export function isValidRegistryAddress(entry: string): boolean {
  return (
    SHADCN_BARE_NAME.test(entry) || NAMESPACE_ADDRESS.test(entry) || GITHUB_ADDRESS.test(entry)
  );
}

/* -------------------------------------------------------------------------- */
/* Rules that run on RAW items, so they still fire when the schema rejects.    */
/* -------------------------------------------------------------------------- */

function checkSchema(rawItems: readonly unknown[]): {
  issues: ValidationIssue[];
  items: QpRegistryItem[];
} {
  const issues: ValidationIssue[] = [];
  const items: QpRegistryItem[] = [];

  rawItems.forEach((raw, index) => {
    const parsed = qpRegistryItemSchema.safeParse(raw);
    if (parsed.success) {
      items.push(parsed.data);
      return;
    }
    const name = rawName(raw);
    issues.push(
      issue(
        "error",
        "schema",
        `items[${String(index)}] failed canonical schema validation:\n${z.prettifyError(parsed.error)}`,
        name === undefined ? {} : { itemName: name },
      ),
    );
  });

  return { issues, items };
}

function checkDuplicateNames(rawItems: readonly unknown[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const firstIndexByName = new Map<string, number>();

  rawItems.forEach((raw, index) => {
    const name = rawName(raw);
    if (name === undefined) {
      return;
    }
    const firstIndex = firstIndexByName.get(name);
    if (firstIndex === undefined) {
      firstIndexByName.set(name, index);
      return;
    }
    issues.push(
      issue(
        "error",
        "duplicate-name",
        `Item name "${name}" is declared twice (items[${String(firstIndex)}] and items[${String(index)}]). Registry item names must be unique.`,
        { itemName: name },
      ),
    );
  });

  return issues;
}

function checkAliases(rawItems: readonly unknown[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const raw of rawItems) {
    if (!isRecord(raw) || !isRecord(raw.aliases)) {
      continue;
    }
    const name = rawName(raw);
    for (const [kind, value] of Object.entries(raw.aliases)) {
      if (typeof value !== "string" || !value.startsWith(ALIAS_PREFIX)) {
        issues.push(
          issue(
            "error",
            "invalid-alias",
            `Alias "${kind}" must be a consumer alias path starting with "${ALIAS_PREFIX}" (got ${JSON.stringify(value)}).`,
            name === undefined ? {} : { itemName: name },
          ),
        );
      }
    }
  }

  return issues;
}

function checkAccessibility(rawItems: readonly unknown[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const raw of rawItems) {
    const name = rawName(raw);
    const location = name === undefined ? {} : { itemName: name };

    if (!isRecord(raw) || !isRecord(raw.accessibility)) {
      issues.push(
        issue(
          "error",
          "missing-accessibility",
          "Item is missing its `accessibility` metadata block. Every registry item must state its WCAG 2.2 AA posture.",
          location,
        ),
      );
      continue;
    }

    const { interactive, keyboardTested, status, knownDefects } = raw.accessibility;
    const recordedDefects = Array.isArray(knownDefects) ? knownDefects.length : 0;

    /*
     * A recorded defect and an "audited" claim are mutually exclusive. Checked
     * for every item, interactive or not, because a contrast or naming defect
     * is just as disqualifying as a keyboard one.
     */
    if (recordedDefects > 0 && status === "audited") {
      issues.push(
        issue(
          "error",
          "missing-accessibility",
          'Item records `accessibility.knownDefects` but claims `status: "audited"`. An item cannot admit a WCAG failure and claim a clean audit at the same time.',
          location,
        ),
      );
    }

    if (interactive !== true) {
      continue;
    }
    if (keyboardTested !== true && recordedDefects === 0) {
      issues.push(
        issue(
          "error",
          "missing-accessibility",
          "Item declares `accessibility.interactive: true` but not `keyboardTested: true`, and records no `knownDefects`. An interactive component ships only once its keyboard path is tested, or once its failure is written down.",
          location,
        ),
      );
    }
    if (status === "not-applicable") {
      issues.push(
        issue(
          "error",
          "missing-accessibility",
          'Item declares `accessibility.interactive: true` with `status: "not-applicable"`. Interactive components always have an accessibility posture.',
          location,
        ),
      );
    }
  }

  return issues;
}

/* -------------------------------------------------------------------------- */
/* Rules that run on PARSED items plus the filesystem snapshot.                */
/* -------------------------------------------------------------------------- */

function checkMissingFiles(
  items: readonly QpRegistryItem[],
  snapshot: RegistrySnapshot,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const item of items) {
    for (const file of item.files) {
      if (!snapshot.files.has(file.path)) {
        issues.push(
          issue("error", "missing-file", `Declared file does not exist on disk.`, {
            itemName: item.name,
            file: file.path,
          }),
        );
      }
    }
  }

  return issues;
}

function checkUnclaimedFiles(
  items: readonly QpRegistryItem[],
  snapshot: RegistrySnapshot,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const claimants = new Map<string, string[]>();

  for (const item of items) {
    for (const file of item.files) {
      const existing = claimants.get(file.path);
      if (existing === undefined) {
        claimants.set(file.path, [item.name]);
      } else {
        existing.push(item.name);
      }
    }
  }

  for (const file of snapshot.registryFiles) {
    const owners = claimants.get(file) ?? [];
    if (owners.length === 0) {
      issues.push(
        issue(
          "error",
          "unclaimed-file",
          "Source file is under a registry root but no registry item ships it. Add an item with `bun run registry:create`, or move the file out of the registry roots.",
          { file },
        ),
      );
    } else if (owners.length > 1) {
      issues.push(
        issue(
          "error",
          "unclaimed-file",
          `Source file is claimed by ${String(owners.length)} items (${owners.join(", ")}). Exactly one item must own each file.`,
          { file },
        ),
      );
    }
  }

  return issues;
}

function checkRegistryDependencies(items: readonly QpRegistryItem[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const localNames = new Set(items.map((item) => item.name));

  for (const item of items) {
    for (const entry of item.registryDependencies) {
      if (localNames.has(entry) || isValidRegistryAddress(entry)) {
        continue;
      }
      issues.push(
        issue(
          "error",
          "unresolved-registry-dependency",
          `registryDependencies entry ${JSON.stringify(entry)} is neither a local item name nor a valid shadcn / @namespace / owner/repo/item address.`,
          { itemName: item.name },
        ),
      );
    }
  }

  return issues;
}

function checkBannedDependencies(
  items: readonly QpRegistryItem[],
  snapshot: RegistrySnapshot,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const isBanned = (specifier: string): boolean =>
    BANNED_DEPENDENCY_SCOPES.some((scope) => specifier.startsWith(scope));

  for (const item of items) {
    for (const dependency of item.dependencies) {
      if (isBanned(dependency)) {
        issues.push(
          issue(
            "error",
            "banned-dependency",
            `Item declares banned dependency ${JSON.stringify(dependency)}. @qpmatrix/ui is built on Base UI + Tailwind; MUI and Emotion are not permitted.`,
            { itemName: item.name },
          ),
        );
      }
    }

    for (const file of item.files) {
      const source = snapshot.files.get(file.path);
      if (source === undefined) {
        continue;
      }
      for (const specifier of extractImportSpecifiers(source)) {
        const packageName = packageNameOf(specifier);
        if (packageName !== null && isBanned(specifier)) {
          issues.push(
            issue(
              "error",
              "banned-dependency",
              `Source imports banned package ${JSON.stringify(specifier)}. @qpmatrix/ui is built on Base UI + Tailwind; MUI and Emotion are not permitted.`,
              { itemName: item.name, file: file.path },
            ),
          );
        }
      }
    }
  }

  return issues;
}

function checkHardcodedColors(
  items: readonly QpRegistryItem[],
  snapshot: RegistrySnapshot,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const item of items) {
    for (const file of item.files) {
      const source = snapshot.files.get(file.path);
      if (source === undefined) {
        continue;
      }
      for (const match of findHardcodedColors(source)) {
        issues.push(
          issue(
            "error",
            "hardcoded-color",
            `${file.path}:${String(match.line)} contains a literal colour value. Use a @qpmatrix/tokens role instead: ${match.text}`,
            { itemName: item.name, file: file.path },
          ),
        );
      }
    }
  }

  return issues;
}

function checkUnknownTokens(
  items: readonly QpRegistryItem[],
  snapshot: RegistrySnapshot,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const item of items) {
    for (const token of item.tokenDependencies) {
      if (!snapshot.knownTokens.has(token)) {
        issues.push(
          issue(
            "error",
            "unknown-token",
            `tokenDependencies entry "${token}" is not a custom property shipped by @qpmatrix/tokens. Add the token to packages/tokens first, or fix the name (values are written without the leading "--").`,
            { itemName: item.name },
          ),
        );
      }
    }
  }

  return issues;
}

/**
 * Does the item declare every token its own files actually consume?
 *
 * `unknown-token` proves a declared token EXISTS. This proves the declaration
 * is COMPLETE, which is the half a consumer depends on: `tokenDependencies` is
 * how an app answers "what breaks if I drop this token?" and how the registry
 * preview reports a component's design-system surface. A list that silently
 * omits `bg-status-error` because someone added an error state last week is
 * worse than no list — it reads as authoritative.
 *
 * It is a WARNING, not an error, in one direction only. A missing entry is
 * always a real omission and is reported; an EXTRA entry is not, because an
 * item may legitimately declare a token it consumes indirectly (through a
 * primitive it composes) that the scanner cannot see in its own source.
 */
function checkTokenCompleteness(
  items: readonly QpRegistryItem[],
  snapshot: RegistrySnapshot,
  lookup: TokenLookup,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const item of items) {
    const used = new Set<string>();
    for (const file of item.files) {
      const source = snapshot.files.get(file.path);
      if (source === undefined) {
        continue;
      }
      for (const token of extractTokenDependencies(source, lookup)) {
        used.add(token);
      }
    }

    const declared = new Set(item.tokenDependencies);
    const missing = [...used].filter((token) => !declared.has(token)).sort();

    if (missing.length > 0) {
      issues.push(
        issue(
          "warning",
          "incomplete-token-dependencies",
          `tokenDependencies is missing ${String(missing.length)} token(s) the item's own source uses: ${missing.join(", ")}. Run \`bun run registry:build\` notes, or add them by hand.`,
          { itemName: item.name },
        ),
      );
    }
  }

  return issues;
}

/**
 * Would two items overwrite each other on install?
 *
 * shadcn resolves a `registry:ui` file to the consumer's `ui` alias directory,
 * FLAT — the source folder structure is not preserved. So two items shipping
 * files with the same basename write to the same path, and the second install
 * silently destroys the first.
 *
 * This is not hypothetical. It was found by installing two components into a
 * scratch app with the real CLI: every component folder shipped an `index.ts`,
 * all of them targeted `components/ui/index.ts`, and two components installed
 * produced exactly one barrel. Barrels are now excluded from distribution
 * (`isFolderBarrel`), and this rule stops the next collision — a shared
 * `types.ts`, `constants.ts`, or a second component named after a primitive.
 *
 * An explicit `target` exempts a file: it is then placed deliberately rather
 * than flattened.
 */
function checkCollidingInstallPaths(items: readonly QpRegistryItem[]): ValidationIssue[] {
  const owners = new Map<string, string[]>();

  for (const item of items) {
    for (const file of item.files) {
      if (file.target !== undefined) {
        continue;
      }
      const basename = file.path.split("/").pop();
      if (basename === undefined) {
        continue;
      }
      owners.set(basename, [...(owners.get(basename) ?? []), item.name]);
    }
  }

  return [...owners.entries()]
    .filter(([, names]) => new Set(names).size > 1)
    .map(([basename, names]) =>
      issue(
        "error",
        "colliding-install-path",
        `${[...new Set(names)].sort().join(", ")} all ship a file called "${basename}" with no \`target\`. shadcn installs registry files FLAT into the consumer's ui directory, so these would overwrite each other and the last install would win. Rename the file, or give it an explicit target.`,
      ),
    );
}

/**
 * Would this item's relative imports still resolve after a flat install?
 *
 * shadcn does NOT preserve source folder structure. Every `registry:ui` file
 * lands directly in the consumer's `ui` alias directory, so a file authored at
 * `src/components/section/section.tsx` arrives at `components/ui/section.tsx`.
 *
 * Some imports survive that move and some do not, and the difference is not
 * obvious from reading the source:
 *
 *   ../ui/card          survives — `components/ui/card.tsx` either way
 *   ../../lib/utils     survives — `lib/utils.ts` either way
 *   ../text/text.types  BREAKS   — flattened, the file is `./text.types`
 *   ../heading          BREAKS   — flattened, the file is `./heading`
 *   ../../lib/motion    BREAKS   — a nested lib module has nowhere to land
 *
 * Discovered by installing five components into a scratch app with the real
 * CLI and resolving all 67 relative imports: three components installed
 * cleanly, and the ones composing SIBLING components produced broken imports
 * that no test in this repo would ever see.
 *
 * This rule simulates that flat install and fails the build here instead. It is
 * the difference between our CI failing and a consumer's app failing.
 */
function checkFlatInstallImports(
  items: readonly QpRegistryItem[],
  snapshot: RegistrySnapshot,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Basenames that will exist in the consumer's flat `ui` directory.
  const flatUiBasenames = new Set<string>();
  // Paths that keep their location because they are not `registry:ui`.
  const libPaths = new Set<string>();

  for (const item of items) {
    for (const file of item.files) {
      const basename = file.path
        .split("/")
        .pop()
        ?.replace(/\.tsx?$/, "");
      if (basename === undefined) {
        continue;
      }
      if (item.type === "utility" || item.type === "hook") {
        libPaths.add(basename);
      } else {
        flatUiBasenames.add(basename);
      }
    }
  }

  for (const item of items) {
    for (const file of item.files) {
      const source = snapshot.files.get(file.path);
      if (source === undefined) {
        continue;
      }

      for (const specifier of extractImportSpecifiers(source)) {
        if (!specifier.startsWith(".")) {
          continue;
        }

        // `../ui/x` and `../../lib/x` land where the author expects.
        if (/^\.\.\/ui\/[a-z0-9-]+$/.test(specifier)) {
          continue;
        }
        if (/^\.\.\/\.\.\/lib\/[a-z0-9-]+$/.test(specifier)) {
          const target = specifier.split("/").pop() ?? "";
          if (libPaths.has(target) || target === "utils") {
            continue;
          }
        }
        /*
         * A NESTED lib module is flattened by the projection into the
         * consumer's flat `lib` directory, where `registry:lib` files land.
         */
        if (/^\.\.\/\.\.\/lib\/[a-z][a-z0-9-]*\/[a-zA-Z0-9._-]+$/.test(specifier)) {
          continue;
        }
        // Hooks land in the consumer's `hooks` alias directory.
        if (/^\.\.\/\.\.\/hooks\/[a-z0-9-]+$/.test(specifier)) {
          continue;
        }
        // A same-folder import flattens to a same-directory import.
        if (specifier.startsWith("./")) {
          continue;
        }
        /*
         * A SIBLING component folder is rewritten at projection time by
         * `flattenRelativeImports` — `../text/text.types` is served as
         * `./text.types`, which resolves because the sibling's files install
         * into the same flat directory as a registryDependency. Verified by
         * installing five components into a scratch app and resolving all 67
         * relative imports.
         */
        if (/^\.\.\/[a-z][a-z0-9-]*(\/[a-zA-Z0-9._-]+)?$/.test(specifier)) {
          continue;
        }

        issues.push(
          issue(
            "error",
            "unresolvable-flat-import",
            `imports "${specifier}", which does NOT survive a flat shadcn install. Files land directly in the consumer's ui directory, so only "../ui/<primitive>", "../../lib/<module>" and same-folder "./" specifiers resolve. Either inline what it needs, or move the shared code under src/lib/ and register it as a utility.`,
            { itemName: item.name, file: file.path },
          ),
        );
      }
    }
  }

  return issues;
}

/**
 * Does the item DECLARE every other item whose files it imports?
 *
 * `registryDependencies` is what makes `shadcn add` pull the rest of the tree.
 * An item that imports a file another item ships, without declaring it,
 * installs into a consumer's project with a dangling import — and nothing in
 * this repo notices, because here the file is simply there on disk.
 *
 * Found exactly this way: the four motion components import
 * `../../lib/motion/motion-core.*` but declared only `cn`, so installing
 * `@qp/reveal` produced four broken specifiers. The repo was green throughout.
 */
function checkUndeclaredDependencies(
  items: readonly QpRegistryItem[],
  snapshot: RegistrySnapshot,
): ValidationIssue[] {
  const shipper = new Map<string, string>();
  for (const item of items) {
    for (const file of item.files) {
      const basename = file.path
        .split("/")
        .pop()
        ?.replace(/\.tsx?$/, "");
      if (basename !== undefined) {
        shipper.set(basename, item.name);
      }
    }
  }

  const issues: ValidationIssue[] = [];

  for (const item of items) {
    const declared = new Set(
      item.registryDependencies.map((entry) => entry.split("/").pop() ?? entry),
    );
    const missing = new Set<string>();

    for (const file of item.files) {
      const source = snapshot.files.get(file.path);
      if (source === undefined) {
        continue;
      }
      for (const specifier of extractImportSpecifiers(source)) {
        if (!specifier.startsWith("..")) {
          continue;
        }
        const target = specifier.split("/").pop();
        if (target === undefined) {
          continue;
        }
        // `utils` is shipped by the `cn` item, whose name does not match it.
        const owner = target === "utils" ? "cn" : shipper.get(target);
        if (owner !== undefined && owner !== item.name && !declared.has(owner)) {
          missing.add(owner);
        }
      }
    }

    for (const owner of [...missing].sort()) {
      issues.push(
        issue(
          "error",
          "undeclared-registry-dependency",
          `imports files shipped by "${owner}" but does not list it in registryDependencies. A consumer running \`shadcn add\` would receive this item WITHOUT ${owner}, leaving a dangling import.`,
          { itemName: item.name },
        ),
      );
    }
  }

  return issues;
}

/* -------------------------------------------------------------------------- */
/* Snapshot-only rule.                                                         */
/* -------------------------------------------------------------------------- */

function checkAliasImportsInSource(snapshot: RegistrySnapshot): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const file of snapshot.sourceFiles) {
    const source = snapshot.files.get(file);
    if (source === undefined) {
      continue;
    }
    for (const match of findAliasImports(source)) {
      issues.push(
        issue(
          "error",
          "no-alias-imports-in-source",
          `${file}:${String(match.line)} imports through the ${ALIAS_PREFIX} path alias. \`tsc --build\` does not rewrite aliases on emit, so this specifier would survive into dist/ and break at runtime for npm consumers. Use a relative specifier: ${match.text}`,
          { file },
        ),
      );
    }
  }

  return issues;
}

/* -------------------------------------------------------------------------- */

const RULE_ORDER: ReadonlyMap<ValidationRule, number> = new Map(
  VALIDATION_RULES.map((rule, index) => [rule, index]),
);

function sortIssues(issues: readonly ValidationIssue[]): ValidationIssue[] {
  return [...issues].sort((a, b) => {
    const byRule = (RULE_ORDER.get(a.rule) ?? 0) - (RULE_ORDER.get(b.rule) ?? 0);
    if (byRule !== 0) {
      return byRule;
    }
    const byItem = compareStrings(a.itemName ?? "", b.itemName ?? "");
    if (byItem !== 0) {
      return byItem;
    }
    const byFile = compareStrings(a.file ?? "", b.file ?? "");
    return byFile === 0 ? compareStrings(a.message, b.message) : byFile;
  });
}

/**
 * Validate a registry value against the canonical schema and the real tree.
 *
 * Pure: identical (registry, snapshot) inputs always produce an identical,
 * deterministically ordered issue list.
 */
export function validate(
  registry: unknown,
  snapshot: RegistrySnapshot,
  lookup: TokenLookup,
): ValidationIssue[] {
  const envelope = qpRegistryEnvelopeSchema.safeParse(registry);
  if (!envelope.success) {
    return [
      issue(
        "error",
        "schema",
        `Registry envelope failed schema validation:\n${z.prettifyError(envelope.error)}`,
      ),
      ...checkAliasImportsInSource(snapshot),
    ];
  }

  const rawItems = envelope.data.items;
  const { issues: schemaIssues, items } = checkSchema(rawItems);

  return sortIssues([
    ...schemaIssues,
    ...checkDuplicateNames(rawItems),
    ...checkAliases(rawItems),
    ...checkAccessibility(rawItems),
    ...checkMissingFiles(items, snapshot),
    ...checkUnclaimedFiles(items, snapshot),
    ...checkRegistryDependencies(items),
    ...checkBannedDependencies(items, snapshot),
    ...checkHardcodedColors(items, snapshot),
    ...checkUnknownTokens(items, snapshot),
    ...checkTokenCompleteness(items, snapshot, lookup),
    ...checkCollidingInstallPaths(items),
    ...checkFlatInstallImports(items, snapshot),
    ...checkUndeclaredDependencies(items, snapshot),
    ...checkAliasImportsInSource(snapshot),
  ]);
}

export function hasErrors(issues: readonly ValidationIssue[]): boolean {
  return issues.some((entry) => entry.level === "error");
}

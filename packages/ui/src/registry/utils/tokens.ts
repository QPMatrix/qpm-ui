import { join } from "node:path";

import { TOKENS_GROUPS_DIR, UI_CSS_PATH, readTextIfExists } from "./paths";

/**
 * Resolution of a component's styling back to the @qpmatrix/tokens roles it
 * actually depends on.
 *
 * Components are written in shadcn's *consumption vocabulary* (`bg-card`,
 * `text-muted-foreground`), which `packages/ui/styles/qpmatrix.css` aliases onto
 * QPMatrix token roles. `tokenDependencies` records the QPMatrix end of that
 * chain, so a token rename shows up as a registry failure instead of a blank
 * component.
 */

/** Matches a top-level token key in `packages/tokens/src/groups/*.ts`. */
const TOKEN_KEY_PATTERN = /^ {2}"([a-z0-9-]+)":\s*\{$/gm;

/** Matches `--name: var(--other);` in the CSS adapter (both `:root` and `@theme`). */
const CSS_ALIAS_PATTERN = /--([a-z0-9-]+)\s*:\s*var\(\s*--([a-z0-9-]+)\s*\)\s*;/g;

/** Tailwind utility prefixes that take a colour role. */
const COLOR_UTILITY_PREFIXES: readonly string[] = [
  "bg",
  "text",
  "border",
  "ring",
  "outline",
  "fill",
  "stroke",
  "from",
  "via",
  "to",
  "divide",
  "placeholder",
  "caret",
  "accent",
  "decoration",
  "shadow",
];

/** Tailwind's logical + physical border-radius sides. */
const RADIUS_SIDES = "(?:t|r|b|l|s|e|tl|tr|br|bl|ss|se|ee|es)";

const MAX_ALIAS_HOPS = 8;

export interface TokenLookup {
  /** `--x: var(--y)` edges, keyed without the leading `--`. */
  readonly aliases: ReadonlyMap<string, string>;
  /** Every custom-property name @qpmatrix/tokens ships, without `--`. */
  readonly known: ReadonlySet<string>;
  /** Tailwind colour role names (`card`, `status-error`, ...). */
  readonly colorRoles: readonly string[];
  /** Tailwind shadow role names (`elevation-raised`, ...). */
  readonly shadowRoles: readonly string[];
}

/**
 * Read token names straight from `packages/tokens/src/groups/*.ts`.
 *
 * Deliberately textual rather than `import "@qpmatrix/tokens"`: the registry
 * must validate in a clean checkout where `packages/tokens/dist` has not been
 * built yet.
 */
export async function loadKnownTokenNames(): Promise<Set<string>> {
  const names = new Set<string>();
  const glob = new Bun.Glob("*.ts");

  for await (const entry of glob.scan({ cwd: TOKENS_GROUPS_DIR, onlyFiles: true })) {
    const source = await Bun.file(join(TOKENS_GROUPS_DIR, entry)).text();
    for (const match of source.matchAll(TOKEN_KEY_PATTERN)) {
      const name = match[1];
      if (name !== undefined) {
        names.add(name);
      }
    }
  }

  if (names.size === 0) {
    throw new Error(
      `No design tokens found in ${TOKENS_GROUPS_DIR}. @qpmatrix/tokens is missing or its ` +
        "group files changed shape — refusing to validate against an empty token set.",
    );
  }
  return names;
}

export async function loadCssAliases(): Promise<Map<string, string>> {
  const css = await readTextIfExists(UI_CSS_PATH);
  if (css === null) {
    throw new Error(`Token adapter stylesheet not found at ${UI_CSS_PATH}.`);
  }

  const aliases = new Map<string, string>();
  for (const match of css.matchAll(CSS_ALIAS_PATTERN)) {
    const from = match[1];
    const to = match[2];
    if (from !== undefined && to !== undefined && !aliases.has(from)) {
      aliases.set(from, to);
    }
  }
  return aliases;
}

export function buildTokenLookup(
  aliases: ReadonlyMap<string, string>,
  known: ReadonlySet<string>,
): TokenLookup {
  const colorRoles: string[] = [];
  const shadowRoles: string[] = [];

  for (const key of aliases.keys()) {
    if (key.startsWith("color-")) {
      colorRoles.push(key.slice("color-".length));
    } else if (key.startsWith("shadow-")) {
      shadowRoles.push(key.slice("shadow-".length));
    }
  }

  return { aliases, known, colorRoles, shadowRoles };
}

export async function loadTokenLookup(): Promise<TokenLookup> {
  const [known, aliases] = await Promise.all([loadKnownTokenNames(), loadCssAliases()]);
  return buildTokenLookup(aliases, known);
}

/**
 * Follow `--a -> --b -> --c` until a name @qpmatrix/tokens actually defines is
 * reached. Returns `null` for names that never bottom out in a real token
 * (Tailwind's own scale, one-off vars, typos).
 */
export function resolveTokenName(name: string, lookup: TokenLookup): string | null {
  let current = name;
  for (let hop = 0; hop <= MAX_ALIAS_HOPS; hop += 1) {
    if (lookup.known.has(current)) {
      return current;
    }
    const next = lookup.aliases.get(current);
    if (next === undefined) {
      return null;
    }
    current = next;
  }
  return null;
}

function buildRoleRegex(prefixes: readonly string[], roles: readonly string[]): RegExp | null {
  if (roles.length === 0) {
    return null;
  }
  const sorted = [...roles].sort((a, b) => b.length - a.length);
  return new RegExp(`(?<![\\w-])(?:${prefixes.join("|")})-(${sorted.join("|")})(?![\\w-])`, "g");
}

/**
 * Every @qpmatrix/tokens role a source file depends on, derived from what it
 * actually writes: Tailwind colour/shadow/radius/font utilities and raw
 * `var(--x)` references. Sorted and de-duplicated so the result is stable.
 */
export function extractTokenDependencies(source: string, lookup: TokenLookup): string[] {
  const found = new Set<string>();

  const add = (candidate: string): void => {
    const resolved = resolveTokenName(candidate, lookup);
    if (resolved !== null) {
      found.add(resolved);
    }
  };

  for (const match of source.matchAll(/var\(\s*--([a-z0-9-]+)/g)) {
    const name = match[1];
    if (name !== undefined) {
      add(name);
    }
  }

  const colorRegex = buildRoleRegex(COLOR_UTILITY_PREFIXES, lookup.colorRoles);
  if (colorRegex !== null) {
    for (const match of source.matchAll(colorRegex)) {
      const role = match[1];
      if (role !== undefined) {
        add(`color-${role}`);
      }
    }
  }

  const shadowRegex = buildRoleRegex(["shadow"], lookup.shadowRoles);
  if (shadowRegex !== null) {
    for (const match of source.matchAll(shadowRegex)) {
      const role = match[1];
      if (role !== undefined) {
        add(`shadow-${role}`);
      }
    }
  }

  // `rounded-md` resolves to `--radius-md` directly: the adapter deliberately
  // does NOT redeclare Tailwind's radius namespace, so @qpmatrix/tokens' own
  // unlayered `--radius-*` values win.
  const radiusRegex = new RegExp(
    `(?<![\\w-])rounded(?:-${RADIUS_SIDES})?-([a-z0-9]+)(?![\\w-])`,
    "g",
  );
  for (const match of source.matchAll(radiusRegex)) {
    const scale = match[1];
    if (scale !== undefined) {
      add(`radius-${scale}`);
    }
  }

  // Same story for the font-family namespace (`font-sans`, `font-mono`, ...).
  // Weight utilities like `font-medium` have no matching token and drop out.
  for (const match of source.matchAll(/(?<![\w-])font-([a-z]+)(?![\w-])/g)) {
    const family = match[1];
    if (family !== undefined) {
      add(`font-${family}`);
    }
  }

  return [...found].sort();
}

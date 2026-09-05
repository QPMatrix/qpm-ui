/**
 * Small, dependency-free readers over component source text.
 *
 * These are lexical, not a TypeScript parse: the registry only needs to know
 * *what a file references*, and a regex over committed, prettier-formatted
 * source is deterministic, instant, and cannot pull a compiler into the
 * validation path.
 */

/** `from "x"`, `import "x"`, `import("x")`, `require("x")`. */
const IMPORT_PATTERNS: readonly RegExp[] = [
  /\bfrom\s*["']([^"']+)["']/g,
  /\bimport\s+["']([^"']+)["']/g,
  /\bimport\s*\(\s*["']([^"']+)["']/g,
  /\brequire\s*\(\s*["']([^"']+)["']/g,
];

/** Literal colour values that must never appear in a component. */
const HARDCODED_COLOR_PATTERN = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\boklch\(|\bhsla?\(/;

/**
 * A CSS attribute selector matching a literal colour, e.g. `[stroke='#ccc']`.
 *
 * This is a SELECTOR, not a declaration: `[&_.recharts-dot[stroke='#fff']]:stroke-transparent`
 * targets markup a third-party library emits with its own hardcoded default and
 * then REPLACES the colour with a token role. The hex is how the element is
 * found, and there is no way to match it without naming it. Flagging these
 * would make it impossible to token-ise any chart library's output.
 */
const COLOR_IN_ATTRIBUTE_SELECTOR = /\[[a-zA-Z-]+\s*[~^$*|]?=\s*['"]?#[0-9a-fA-F]{3,8}['"]?\]/g;

/**
 * A relative colour derived from a token, e.g.
 * `oklch(from var(--primary) 0.93 calc(c * 0.4) h)`.
 *
 * CSS Colour 5 relative syntax reads an existing colour and transforms it. When
 * the source is `var(--token)` the value still tracks the token — change the
 * token and this changes with it, which is exactly what the rule wants. Only a
 * relative colour derived from a LITERAL is a real violation, and that is still
 * caught because the literal itself matches.
 *
 * `[\s_]` rather than `\s`: inside a Tailwind arbitrary value spaces are
 * written as underscores (`bg-[oklch(from_var(--primary)_0.93_h)]`), which is
 * the form these actually appear in.
 */
const RELATIVE_COLOR_FROM_TOKEN =
  /\b(?:oklch|oklab|lab|lch|color|rgba?|hsla?)\([\s_]*from[\s_]+var\(--[a-z0-9-]+\)/g;

/** The `@/...` path alias. `tsc --build` does not rewrite it on emit. */
const ALIAS_SPECIFIER_PREFIX = "@/";

export interface SourceMatch {
  /** 1-based line number. */
  readonly line: number;
  /** The trimmed source line, for an actionable error message. */
  readonly text: string;
}

export function extractImportSpecifiers(source: string): string[] {
  const specifiers = new Set<string>();
  for (const pattern of IMPORT_PATTERNS) {
    for (const match of source.matchAll(pattern)) {
      const specifier = match[1];
      if (specifier !== undefined) {
        specifiers.add(specifier);
      }
    }
  }
  return [...specifiers].sort();
}

/**
 * npm package name for a bare specifier, or `null` for anything that is not an
 * installable package (relative paths, the `@/` alias, absolute paths).
 */
export function packageNameOf(specifier: string): string | null {
  if (
    specifier.startsWith(".") ||
    specifier.startsWith("/") ||
    specifier.startsWith(ALIAS_SPECIFIER_PREFIX)
  ) {
    return null;
  }
  const segments = specifier.split("/");
  if (specifier.startsWith("@")) {
    const scope = segments[0];
    const name = segments[1];
    if (scope === undefined || name === undefined) {
      return null;
    }
    return `${scope}/${name}`;
  }
  const first = segments[0];
  return first === undefined || first.length === 0 ? null : first;
}

function matchLines(source: string, predicate: (line: string) => boolean): SourceMatch[] {
  const matches: SourceMatch[] = [];
  source.split("\n").forEach((line, index) => {
    if (predicate(line)) {
      matches.push({ line: index + 1, text: line.trim() });
    }
  });
  return matches;
}

/**
 * Is this line entirely a comment?
 *
 * The hardcoded-colour rule scans line by line, and a doc comment is prose:
 * `<QPHeading level={3}>Build #4102</QPHeading>` in an example is a build
 * number, and `// see #ff0000 for why` is a note ABOUT a colour, not a use of
 * one. Flagging either produces an error whose only fix is to reword a
 * comment, which teaches authors that the rule is noise.
 *
 * Deliberately conservative: only lines that are wholly comment are skipped,
 * so `className="bg-[#8B5CF6]" // brand` is still caught. A trailing-comment
 * heuristic would need real tokenisation to be safe, and the failure mode of
 * getting it wrong is a colour that ships.
 */
function isCommentLine(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed.startsWith("//") ||
    trimmed.startsWith("*") ||
    trimmed.startsWith("/*") ||
    trimmed.startsWith("{/*")
  );
}

export function findHardcodedColors(source: string): SourceMatch[] {
  return matchLines(source, (line) => {
    if (isCommentLine(line)) {
      return false;
    }
    // Strip the two shapes that LOOK like a hardcoded colour but are not,
    // then test what remains. Stripping rather than skipping the whole line
    // matters: a line may legitimately derive one colour from a token AND
    // illegitimately hardcode another.
    const stripped = line
      .replaceAll(COLOR_IN_ATTRIBUTE_SELECTOR, "")
      .replaceAll(RELATIVE_COLOR_FROM_TOKEN, "");
    return HARDCODED_COLOR_PATTERN.test(stripped);
  });
}

export function findAliasImports(source: string): SourceMatch[] {
  return matchLines(source, (line) =>
    extractImportSpecifiers(line).some((specifier) => specifier.startsWith(ALIAS_SPECIFIER_PREFIX)),
  );
}

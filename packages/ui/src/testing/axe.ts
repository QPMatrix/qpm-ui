import type { AxeResults, ImpactValue, NodeResult, Result } from "axe-core";

/**
 * axe-core integration for @qpmatrix/ui's test suite.
 *
 * WHY THE DYNAMIC IMPORT: this repo's happy-dom registration
 * (`src/test-setup.ts`) must finish running before axe-core's module body
 * evaluates, or axe's own environment detection binds to an undefined
 * `document`. A static top-level `import axe from "axe-core"` is part of the
 * static import graph and is not guaranteed to run after the dynamic,
 * side-effecting `GlobalRegistrator.register()` call in test-setup.ts — the
 * same ordering hazard documented at the top of test-setup.ts for
 * `@testing-library/jest-dom/matchers`. `await import("axe-core")` inside
 * `runAxe` defers evaluation to call time, after every test file's
 * `import "../test-setup"` (or equivalent) has already run.
 *
 * WHY `color-contrast` IS DISABLED: axe's `color-contrast` rule needs a real
 * layout + computed-style engine to resolve `var(--token)` chains down to a
 * literal colour. Under happy-dom (no layout engine) it always comes back
 * `incomplete`, never `pass`/`violation` — reproduced directly. Colour is
 * therefore verified separately, at the design-token layer, by
 * `src/testing/contrast.ts`. Do not read a clean `runAxe` result as a
 * contrast pass; contrast has its own check (`a11y:contrast`).
 */

/** WCAG 2.2 Level AA rule tags, plus the 2.0/2.1 tags AA builds on. */
const WCAG22AA_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] as const;

export interface RunAxeOptions {
  /** Additional axe-core rule tags to include, on top of the WCAG 2.2 AA set. */
  readonly extraTags?: readonly string[];
}

/**
 * Run axe-core's WCAG 2.2 AA ruleset against a rendered DOM subtree.
 * `color-contrast` is always disabled — see the module doc comment above.
 */
export async function runAxe(container: HTMLElement, options?: RunAxeOptions): Promise<AxeResults> {
  const { default: axe } = await import("axe-core");
  const tags =
    options?.extraTags === undefined ? WCAG22AA_TAGS : [...WCAG22AA_TAGS, ...options.extraTags];
  return axe.run(container, {
    runOnly: { type: "tag", values: [...tags] },
    rules: {
      // Never reliable under happy-dom (no layout engine) — see module doc
      // comment. Contrast is asserted separately by src/testing/contrast.ts.
      "color-contrast": { enabled: false },
    },
  });
}

function formatImpact(impact: ImpactValue): string {
  return impact ?? "unknown";
}

function formatNode(node: NodeResult): string {
  const html = node.html.length > 200 ? `${node.html.slice(0, 200)}…` : node.html;
  const summary = node.failureSummary === undefined ? "" : `\n      ${node.failureSummary}`;
  return `    - ${html}${summary}`;
}

function formatViolation(violation: Result): string {
  const nodeLines = violation.nodes.map(formatNode).join("\n");
  return [
    `  [${violation.id}] impact=${formatImpact(violation.impact ?? null)}`,
    `    ${violation.help}`,
    `    ${violation.helpUrl}`,
    nodeLines,
  ].join("\n");
}

/**
 * Format the `incomplete` list axe returns for findings it could not
 * automatically resolve (a manual-review queue) — most notably every
 * `color-contrast` result before we disabled the rule, and any rule that
 * needs information axe cannot infer from the static tree alone.
 */
export function formatIncomplete(incomplete: readonly Result[]): string {
  if (incomplete.length === 0) {
    return "";
  }
  const lines = incomplete.map(
    (result) =>
      `  [${result.id}] ${result.help} (${result.nodes.length} node(s)) — needs manual review`,
  );
  return `Needs manual review (axe "incomplete"):\n${lines.join("\n")}`;
}

/**
 * Run `runAxe` and throw a readable error naming every violation (rule id,
 * impact, help URL, failing node HTML) if any were found. On success, returns
 * the `incomplete` list so the caller can still surface what automation could
 * not decide — a clean run is not the same as "nothing left to check".
 */
export async function expectNoAxeViolations(
  container: HTMLElement,
  options?: RunAxeOptions,
): Promise<readonly Result[]> {
  const results = await runAxe(container, options);
  if (results.violations.length > 0) {
    const message = [
      `axe-core found ${results.violations.length} WCAG 2.2 AA violation(s):`,
      ...results.violations.map(formatViolation),
    ].join("\n");
    throw new Error(message);
  }
  return results.incomplete;
}

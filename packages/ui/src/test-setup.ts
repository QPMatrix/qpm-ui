/**
 * DOM test environment bootstrap for @qpmatrix/ui.
 *
 * `bun test` does not read a workspace-root bunfig.toml preload here (there
 * isn't one, and this package's WRITE SET does not include the repo root
 * bunfig.toml), so DOM registration happens via a plain module import
 * instead: every `*.test.tsx` file does `import "../test-setup"` (adjusted
 * for its depth) before importing anything from `@testing-library/react` or
 * `react-dom`. See packages/.agents/skills/ui/SKILL.md, "Testing" section.
 *
 * Every import below is *dynamic* (`await import(...)`), not static. This
 * is deliberate, not stylistic: `@testing-library/jest-dom/matchers`
 * statically imports `@testing-library/dom`, whose `screen` export binds
 * `document` at *module-evaluation time*. Empirically, Bun does not
 * reliably finish evaluating one static sibling import's whole subtree
 * before starting the next one when a package (node_modules) import and a
 * relative (src) import are mixed in the same file — @testing-library/dom
 * was observed evaluating (with `document` still undefined) before a
 * same-file, earlier-declared relative side-effect import's own body had
 * run. Dynamic `import()` calls are ordinary runtime expressions, not part
 * of the static import graph, so `await`ing each one in sequence below is
 * the only ordering guarantee that held up under direct reproduction.
 */
const { GlobalRegistrator } = await import("@happy-dom/global-registrator");
if (typeof document === "undefined") {
  GlobalRegistrator.register();
}

// jest-dom matchers (toBeInTheDocument, toBeChecked, toHaveAttribute, ...).
// Type declarations for these are merged into bun:test's Matchers interface
// in matchers.d.ts (declaration merging, see Bun's testing-library docs).
// Imported dynamically, after registration, for the same reason as above.
// `default` is destructured out and discarded: a dynamic import() of a CJS
// module synthesizes a `default` key alongside the named matcher exports,
// which isn't a matcher function and breaks expect.extend()'s type.
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- discarded on purpose, see comment above
const { default: cjsDefault, ...matchers } = await import("@testing-library/jest-dom/matchers");
const { expect } = await import("bun:test");
expect.extend(matchers);

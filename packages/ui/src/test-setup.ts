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

/**
 * Deterministic motion teardown (QPMSEC-433, PR #1 gate round 4): the
 * hosted runner failed `@qpmatrix/ui test` with "2 errors" — `bun test`'s
 * "Unhandled error between tests" — `AbortError: The animation was
 * canceled.`, thrown from happy-dom's `Animation.cancel` via motion-dom's
 * `NativeAnimation.stop`. Root cause: motion-dom prefers the real Web
 * Animations API when the environment appears to support it (happy-dom
 * does implement `Element.animate()`), so an animated component leaves a
 * REAL, asynchronous `Animation` object running on unmount; that object's
 * eventual `.cancel()` — scheduled on requestAnimationFrame's callback
 * queue, not synchronous with the test's own `cleanup()` — can fire after
 * the test that started it has already finished, landing the resulting
 * rejection nowhere bun:test can attribute it to. This never reproduced
 * on the machine this fix was written on (animations finish before
 * cleanup runs on a fast box); it does not need to reproduce here to be
 * a real bug, since it is a race whose window only widens under load —
 * the hosted runner hit it, and a slower or busier machine will too.
 *
 * `MotionGlobalConfig.skipAnimations = true` fixes this categorically
 * rather than narrowing the race: read `motion-dom`'s own
 * `animation/interfaces/motion-value.mjs`, EVERY animation checks
 * `MotionGlobalConfig.instantAnimations || MotionGlobalConfig.skipAnimations
 * || …` before it ever decides between the native-WAAPI and JS animation
 * implementations, and `shouldSkip` short-circuits straight to
 * `makeAnimationInstant()` (forces `duration = 0`) when it's set — no
 * native `Animation` object, and therefore no async `.cancel()`, is ever
 * created for the rest of this test run. `MotionGlobalConfig` is a
 * plain mutable object re-exported from `motion-utils` through
 * `framer-motion` (`export { MotionGlobalConfig } from "motion-utils"`)
 * and then through `motion/react` (`export * from "framer-motion"`) —
 * `@qpmatrix/ui` already depends on `motion` directly, so importing it
 * from `motion/react` reaches for a package this repo already declares,
 * not a transitive one. Imported dynamically, after DOM registration,
 * for the same static-import-ordering reason documented above (`motion`'s
 * module graph does its own environment feature-detection at import
 * time, so it must not evaluate before `document` exists). Set once,
 * globally, for the lifetime of the whole `bun test` process — this
 * module is import-cached across every `*.test.tsx` file that imports
 * it, so the flag is live before any test file's own `render()` call,
 * not just the first one to import this module.
 */
const { MotionGlobalConfig } = await import("motion/react");
MotionGlobalConfig.skipAnimations = true;

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

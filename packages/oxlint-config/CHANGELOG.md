# @qpmtx/oxlint-config

## 0.1.0

### Minor Changes

- New package (QPMSEC-433), replacing `@qpmatrix/eslint-config` +
  `@qpmatrix/eslint-plugin-architecture` from `qpmatrix-packages` —
  the owner ruling for this repo is oxlint, not eslint. `base.json`
  re-expresses `eslint-config`'s `base.ts` rule set (core correctness
  rules, the `typescript-eslint` recommended/stylistic type-checked
  sets, `import-x`'s cross-cutting import rules) as oxlint rules;
  `react.json` re-expresses `react.ts` (JSX/hooks/a11y rules, the
  `@mui`/`@emotion`/`@base-ui/react` app-boundary ban). Two rules from
  the old config have no oxlint equivalent and are documented as GAPS
  in `docs/lint.md` rather than silently dropped: `eslint-plugin-
architecture`'s `no-cross-module-import` (a custom AST rule with no
  oxlint plugin-rule port yet) and `react.ts`'s `no-restricted-syntax`
  selectors (inline `style={{ … }}` / `import * as React` bans — oxlint
  has no ESLint-`no-restricted-syntax`-equivalent AST-selector rule).
- Publish scope moved from `@qpmatrix/*` to `@qpmtx/*` (QPMSEC-433,
  owner ruling 2026-09-05 — `@qpmtx` is the npm account the owner
  holds). No code changed; published as `@qpmtx/oxlint-config`.

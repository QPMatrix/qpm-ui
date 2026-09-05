# Lint: oxlint replaces eslint (QPMSEC-433)

Reference for this repo's lint tooling — what `@qpmtx/oxlint-config`
covers from `qpmatrix-packages`' old `@qpmtx/eslint-config` +
`@qpmtx/eslint-plugin-architecture` pair, and what it does not.
Owner ruling for this repo (2026-09-05): oxlint instead of eslint.
`eslint-config` and `eslint-plugin-architecture` are retired, not ported;
every eslint dependency is gone from this workspace.

## What's covered

`packages/oxlint-config/base.json` re-expresses `eslint-config`'s
`base.ts` — this repo's own `.oxlintrc.json` extends it and is what
`./check lint` (`bun --bun oxlint --type-aware -c .oxlintrc.json .`) runs:

- Core correctness rules: `curly`, `eqeqeq`, `no-alert`, `no-debugger`,
  `no-duplicate-imports`, `no-eval`, `no-implied-eval`, `no-new-func`.
- The `typescript-eslint` recommended/stylistic type-checked rule sets,
  via oxlint's `--type-aware` mode (needs the `oxlint-tsgolint` companion
  package, a devDependency here): `typescript/consistent-type-exports`,
  `typescript/consistent-type-imports`, `typescript/no-confusing-void-expression`,
  `typescript/no-deprecated` (warn), `typescript/no-explicit-any`,
  `typescript/no-floating-promises`, `typescript/no-misused-promises`,
  `typescript/no-non-null-assertion`, `typescript/no-unnecessary-type-assertion`,
  `typescript/no-unsafe-argument`, `typescript/no-unsafe-assignment`,
  `typescript/no-unsafe-call`, `typescript/no-unsafe-member-access`,
  `typescript/no-unsafe-return`, `typescript/prefer-nullish-coalescing`,
  `typescript/prefer-optional-chain`, `typescript/require-await`,
  `typescript/return-await`, `typescript/switch-exhaustiveness-check`.
- `import-x`'s cross-cutting import rules, via oxlint's `import` plugin:
  `import/first`, `import/newline-after-import`, `import/no-absolute-path`,
  `import/no-cycle`, `import/no-duplicates`, `import/no-self-import`.
- An override block turns every type-aware rule off for config files,
  `scripts/**`, and `tests/fixtures/**` — the same carve-out
  `base.ts`'s `qpmatrix/config-files` block gave those paths via
  `tseslint.configs.disableTypeChecked`.

`packages/oxlint-config/react.json` (extends `base.json`) re-expresses
`eslint-config`'s `react.ts` — not used by this repo's own `.oxlintrc.json`
(same as the old root `eslint.config.ts`, which only ever loaded `base`;
`react.ts` was for consuming apps, not for `@qpmtx/ui`'s own source):

- `react/jsx-boolean-value`, `react/no-array-index-key`, `react/no-danger`
  (warn), `react/no-unstable-nested-components`, `react/self-closing-comp`.
- `react-hooks`'s pair, via oxlint's `react` plugin:
  `react/rules-of-hooks`, `react/exhaustive-deps` (warn).
- `jsx-a11y`'s rule set, via oxlint's `jsx-a11y` plugin under the
  `correctness`/`suspicious` categories (oxlint's `jsx_a11y/*` rule
  names use an underscore, not a hyphen, in `rules`/`--print-config`
  output — the plugin name in `plugins` still uses a hyphen).
- `no-restricted-imports`, banning `@mui/*`, `@emotion/*` and
  `@base-ui/react` from application code — the same app-boundary rule
  `react.ts` enforced (a primitive imported straight into an app is
  unstyled, untokenised, and outside `@qpmtx/ui`'s accessibility
  gates).

## GAPS — no oxlint equivalent (documented, not dropped)

1. **`import-x/no-useless-path-segments`.** oxlint's `import` plugin has
   no rule by this name (confirmed against oxlint 1.81.0 —
   `oxlint --print-config` refuses a config naming it: `Rule
'no-useless-path-segments' not found in plugin 'import'`). No
   replacement rule exists in any oxlint plugin as of this writing.

2. **`react.ts`'s two `no-restricted-syntax` selectors.** ESLint's
   `no-restricted-syntax` takes an arbitrary ESQuery AST selector;
   oxlint has no equivalent generic-selector rule, so neither ported:
   - `ImportDeclaration[source.value='react'] > ImportNamespaceSpecifier`
     — banned `import * as React from "react"` (named imports only, so a
     reader can see which React APIs a file actually uses).
   - `JSXAttribute[name.name='style'] > JSXExpressionContainer >
ObjectExpression > Property[key.value!=/^--/]` — banned inline
     `style={{ ... }}` except CSS custom-property passthrough
     (`style={{ "--gap": value }}`), since a `style` object bypasses
     `@qpmtx/tokens` and the registry's hardcoded-colour checks.

   oxlint's `jsPlugins` mechanism (alpha as of 1.81.0 — "not subject to
   semver" per its own schema) could host a custom rule implementing
   either selector, but was not attempted here: alpha-API surface,
   unverified against this version, and out of scope for a lint-tool
   swap that must not itself become a source of new findings. A future
   leg can pick this up once `jsPlugins` is stable.

3. **`@qpmtx/eslint-plugin-architecture`'s `no-cross-module-import`.**
   A custom ESLint rule (`packages/eslint-plugin-architecture` in
   `qpmatrix-packages`, retired — not ported to this repo, which has no
   `src/modules/<feature>/` layout to enforce anyway): forbids reaching
   into another feature module's internal files, requiring imports to
   go through that module's `index.ts` barrel. This is API-service
   layering logic (ADR-001 / architecture.md §3 rule 3), not a UI/tokens
   concern — `@qpmtx/ui` and `@qpmtx/tokens` have no `modules/`
   directory for it to apply to. Same `jsPlugins`-is-alpha reasoning as #2 applies if an
   estate API-service repo ever needs an oxlint port of this rule.

None of these three were silently dropped: each is either enforced by a
category/rule oxlint doesn't ship, or governs a layout this repo doesn't
have. If a future package here grows a `modules/` layout or needs the
`no-restricted-syntax` selectors, re-open this doc before assuming oxlint
already covers it.

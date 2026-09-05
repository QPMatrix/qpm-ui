# @qpmatrix/tokens

## 0.3.0

### Minor Changes

- Remade in qpm-ui (QPMSEC-433). Ported verbatim from
  `qpmatrix-packages@c498f95` (`packages/tokens`, 0.2.1) into this
  package's own public repo — same 246-token source, same
  `tokens.css` / typed-token-object split, same `cssVar()` helper.
  No token values or behaviour changed; only the repo, toolchain
  (oxlint replaces eslint), and version numbering moved.

## 0.2.1 (qpmatrix-packages)

### Patch Changes

- 7f7144f: Publish compiled `dist/` + `.d.ts` output instead of raw TypeScript source.

## 0.2.0 (qpmatrix-packages)

### Minor Changes

- 5a3068b: Initial release of the QPMatrix design token system (v0.1.0): 246 tokens
  transcribed verbatim from the owner's design source across six groups
  (colors-and-gradients, typography, spacing-and-layout, radius,
  elevation-and-glow-shadows, motion-and-zindex). Ships tokens.css
  (dark-default :root + [data-theme="light"] overrides + qp-\* keyframes +
  reduced-motion guard) via `@qpmatrix/tokens/css`, and const-asserted TS
  token objects plus a `cssVar()` helper via `@qpmatrix/tokens`.

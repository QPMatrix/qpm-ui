# @qpmtx/prettier-config

## 0.1.0

### Minor Changes

- Remade in qpm-ui (QPMSEC-433). Ported verbatim from
  `qpmatrix-packages@c498f95` (`packages/prettier-config`, 0.1.1) into
  this package's own public repo — same rule set, compiled `dist/` +
  `.d.ts` output. No formatting rules changed; the version number
  restarts at 0.1.0 for this repo's own release history rather than
  continuing qpmatrix-packages' numbering.
- Publish scope moved from `@qpmatrix/*` to `@qpmtx/*` (QPMSEC-433,
  owner ruling 2026-09-05 — `@qpmtx` is the npm account the owner
  holds). No code changed; published as `@qpmtx/prettier-config`.

## 0.1.1 (qpmatrix-packages)

### Patch Changes

- fef5ff3: Publish compiled `dist/` + `.d.ts` output instead of raw `index.ts`.

## 0.1.0 (qpmatrix-packages)

### Minor Changes

- Initial release of shared QPMatrix packages for development (v0.1.0).

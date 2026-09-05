# @qpmtx/ui

## 1.1.0

### Minor Changes

- Remade in qpm-ui (QPMSEC-433). Ported verbatim from
  `qpmatrix-packages@c498f95` (`packages/ui`, 1.0.3) into this
  package's own public repo — same 83 registry items (61 shadcn/Base
  UI primitives, 19 QPMatrix components, shared library modules), same
  Storybook stories, same registry/a11y tooling. No component
  behaviour or design changed; only the repo, toolchain (oxlint
  replaces eslint), and version numbering moved.
- Publish scope moved from `@qpmatrix/*` to `@qpmtx/*` (QPMSEC-433,
  owner ruling 2026-09-05 — `@qpmtx` is the npm account the owner
  holds). No code changed; published as `@qpmtx/ui`.

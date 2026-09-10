# @qpmtx/ui

## 1.2.0

### Minor Changes

- `QPSegmentedControl` gains `segmentWidth: "auto" | "equal"` (default
  `"auto"`). `"auto"` sizes every segment to its own label instead of forcing
  an equal `flex-1` share, so unequal labels no longer overlap; `"equal"`
  keeps the pre-existing behaviour for callers who already relied on it
  (QPMSEC-787).
- `QPSection` gains `contentClassName`, a handle on the content slot
  (`data-slot="section-content"`) so a child that must fill the section's
  remaining height no longer has to be promoted to a sibling of the section
  (QPMSEC-787).
- `styles/qpmatrix.css` now declares its own Tailwind v4 `@source "../dist"`
  line, so a consumer that only does `@import "@qpmtx/ui/css"` gets every
  utility class this package's own components emit — no `@source` of their
  own required (QPMSEC-787).
- `QPIcon` — `lucide-react`, already a dependency of this package, re-exported
  as one tree-shakeable namespace, so a component with an icon slot
  (`EmptyMedia`, `QPIconButton`) never forces a consumer to add an icon
  library of their own (QPMSEC-787).

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

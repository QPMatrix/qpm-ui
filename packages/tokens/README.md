# @qpmtx/tokens

The QPMatrix design token system - colors, typography, spacing, radius,
elevation/glow shadows, motion, and z-index - transcribed verbatim from the
owner's design source (`QPMatrix Design System.html`). This package is
framework-agnostic: no React, no MUI, no styling runtime. It ships two
aligned deliverables generated from the same 246-token source so they can
never drift apart:

- CSS custom properties - `tokens.css`, importable via `@qpmtx/tokens/css`
- Typed token objects - const-asserted TS objects, importable via `@qpmtx/tokens`

The MUI theme factory that consumes these tokens lives in `@qpmtx/ui`
(QPM-38), not here - this package only owns the token values themselves.

## Install

Within the monorepo, add it as a workspace dependency:

```jsonc
// apps/*/package.json
{
  "dependencies": {
    "@qpmtx/tokens": "workspace:*",
  },
}
```

## CSS usage

Import the stylesheet once, at the app root (before any component styles):

```ts
import "@qpmtx/tokens/css";
```

This defines every `--var` on `:root` (dark theme, the default - QPMatrix's
primary brand expression) plus a `[data-theme="light"]` override block for
the subset of semantic tokens that change in light mode. Toggle themes by
setting `data-theme="light"` (or removing it to fall back to dark) on `<html>`
or any ancestor element:

```tsx
<html data-theme={theme === "light" ? "light" : undefined}>
```

The stylesheet also ships the `qp-*` keyframes (`qp-pulse`, `qp-halo`,
`qp-flow`, `qp-sweep`, `qp-breathe`, `qp-orbit`, `qp-rise`, `qp-shimmer`,
`qp-scan`), five ready-to-use `.qp-anim-*` utility classes, and a
`prefers-reduced-motion: reduce` guard that clamps all animation/transition
durations to near-zero - respected automatically, no opt-in required.

```css
.badge {
  color: var(--fg-primary);
  background: var(--surface-primary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
}
```

## TypeScript usage

Reference tokens by name instead of hardcoding CSS strings, so a renamed or
removed token becomes a type error:

```ts
import { cssVar, colorsAndGradients, radius } from "@qpmtx/tokens";

const style = {
  color: cssVar("fg-primary"),
  borderRadius: cssVar("radius-md"),
};

colorsAndGradients["brand-primary"].resolved;
colorsAndGradients["brand-primary"].light?.resolved;
radius["radius-md"].resolved;
```

Every token entry has the shape:

```ts
{
  raw: string;
  resolved: string;
  light?: { raw: string; resolved: string };
  usedByComponentBundle: boolean;
}
```

Six named exports mirror the source's semantic grouping exactly:

| Export                    | Group                      | Count                          |
| ------------------------- | -------------------------- | ------------------------------ |
| `colorsAndGradients`      | colors-and-gradients       | 93 (41 have `light` overrides) |
| `typography`              | typography                 | 77                             |
| `spacingAndLayout`        | spacing-and-layout         | 28                             |
| `radius`                  | radius                     | 6                              |
| `elevationAndGlowShadows` | elevation-and-glow-shadows | 18                             |
| `motionAndZIndex`         | motion-and-zindex          | 24                             |

Only `colorsAndGradients` has theme-aware (`light`) entries - typography,
spacing, radius, elevation, and motion tokens are theme-invariant by design.

## Dark/light theming model

Dark is the default `:root` expression and QPMatrix's primary brand surface.
`[data-theme="light"]` overrides only the 41 semantic color tokens that need
to change for light mode (backgrounds, surfaces, foregrounds, borders, brand,
signal, and status colors) - raw palette ramps, typography, spacing, radius,
elevation shape, and motion timing do not change between themes.

## Extending the token system

Never hand-transcribe a new hex/px value from a mockup. See
`packages/.agents/skills/tokens/SKILL.md` for the read-live-source-first rule
and the exact steps to add a token (CSS + TS + test together).

## Validation

```sh
bun test packages/tokens
bun run --filter @qpmtx/tokens build
```

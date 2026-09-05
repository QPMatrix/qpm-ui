# @qpmatrix/ui

The QPMatrix component library — **the only module QPMatrix apps import
components from** (ADR-005).

A shadcn/ui source-owned library: [Base UI](https://base-ui.com) primitives
underneath, Tailwind v4 on top, [Motion](https://motion.dev) for animation, and
every colour, size and duration resolved from `@qpmatrix/tokens` through the
adapter in `styles/qpmatrix.css`.

Raw `@mui/*`, `@emotion/*`, `@base-ui/react` and `motion/react` imports are
lint-banned in application code (see `packages/eslint-config/react.ts`): a
primitive imported straight into an app is unstyled, untokenised, and outside
the accessibility gates this package applies.

**83 registry items** — 61 shadcn/Base UI primitives, 19 QPMatrix components,
and the shared library modules. 165 Storybook stories.

## Install

Within the monorepo:

```jsonc
{ "dependencies": { "@qpmatrix/ui": "workspace:*" } }
```

Then, **once, at the app root**:

```css
@import "@qpmatrix/ui/css";
```

That pulls in Tailwind, shadcn's variants and `@qpmatrix/tokens` in the order
the cascade requires. Do **not** import `@qpmatrix/tokens/css` separately.

## Using it

```tsx
import { QPMetricCard, QPSection, QPPageContainer, QPButton } from "@qpmatrix/ui";

export function Dashboard() {
  return (
    <QPPageContainer as="main" width="wide">
      <QPSection heading="Pipelines" level={1} description="Last 24 hours" reveal>
        <QPMetricCard
          label="Requests"
          value="4.2M"
          trend={{ direction: "up", value: "+12.4%", label: "up 12.4 percent versus last week" }}
        />
      </QPSection>
    </QPPageContainer>
  );
}
```

### The `QP` prefix

**Every public export is prefixed** — `QPButton`, `QPMetricCard`,
`qpMetricCardVariants`, `QP_PRODUCT_BADGE_NAMES`. An app importing from a dozen
packages should never have to wonder whose `Button` it just imported.

The primitives under `src/components/ui/` keep their unprefixed shadcn names
_on disk_, because those files are written and re-written by the shadcn CLI and
renaming their declarations would break every `shadcn update`. The prefix is
applied at the package boundary in `src/index.ts` instead.

### Theming

There is **no theme provider to mount**. Dark is `:root` and light is
`[data-theme="light"]`, both defined by `@qpmatrix/tokens` — so switching themes
is one attribute on `<html>`, settable server-side with no hydration flash:

```tsx
import { resolveThemeSelection, themeAttributes } from "@qpmatrix/ui";

<html lang={locale} {...themeAttributes(resolveThemeSelection(serverTheme))}>
```

## What's inside

| Area                | What                                                                                                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Primitives** (61) | `QPButton`, `QPDialog`, `QPTable`, `QPSheet`, `QPSidebar`, `QPCommand`, `QPCalendar`, `QPChart`, …                                                               |
| **Components** (19) | `QPIconButton`, `QPMetricCard`, `QPChatPanel`, `QPComposer`, `QPMessageBubble`, `QPSegmentedControl`, `QPStatusIndicator`, `QPProductBadge`, `QPTypingIndicator` |
| **Typography**      | `QPText` (16-step ramp), `QPHeading` (outline level is a required prop)                                                                                          |
| **Layout**          | `QPPageContainer`, `QPSection`                                                                                                                                   |
| **Content**         | `QPProse` + `qpMdxComponents` for Markdown/MDX                                                                                                                   |
| **Motion**          | `QPMotion`, `QPReveal`, `QPStagger`, `QPPageTransition`, plus the token-bound vocabulary in `src/lib/motion`                                                     |

Every animation degrades under `prefers-reduced-motion: reduce` — the motion
components strip transforms and keep only a cross-fade, so nothing is lost.

## Installing a component as source

The package is also a **shadcn source registry**, so an app that needs to _edit_
a component can copy it instead of importing it.

> **This repository is PRIVATE, so the GitHub address form does not work yet.**
> shadcn resolves `owner/repo/item` by fetching `raw.githubusercontent.com`
> **unauthenticated**, which 404s for a private repo. Verified:
> `curl .../QPMatrix/qpm-ui/main/registry.json` → `404`, while the
> authenticated API returns the same file. The manifest is correct — only the
> transport is blocked. Making the repository public is the only change needed.

Until then, serve the registry and install from it by URL. This is the path
proven end-to-end (13 components, 62 files, all 121 imports resolving):

```sh
# in this repo
bun run --filter @qpmatrix/ui registry:preview -- --namespace @qp
```

```jsonc
// in the consuming app's components.json
{ "registries": { "@qp": "http://localhost:4321/r/{name}.json" } }
```

```sh
bunx --bun shadcn@latest add @qp/metric-card
```

Once the repository is public, the address form works with no other change:

```sh
bunx --bun shadcn@latest add QPMatrix/qpm-ui/metric-card
```

Browse what ships, with install commands, token dependencies and accessibility
status:

```sh
bun run --filter @qpmatrix/ui registry:preview     # → http://localhost:4321
```

## Developing

```sh
bun run scaffold -- --list                 # archetypes + every composable primitive
bun run scaffold -- --name status-pill --archetype passthrough --primitive badge
bun run scaffold -- --fill-all             # add missing files to existing components

bun run storybook                          # dev server, a11y panel per story
bun run storybook:build                    # static build
bun run storybook:preview                  # serve the built output

bun run registry:check <name>              # the machine-checkable definition of done
bun run registry:build                     # regenerate both manifests
bun run registry:preview                   # browse the registry

bun run a11y:audit                         # axe over every component
bun run a11y:contrast                      # every colour pair, both themes
bun run a11y:contract                      # keyboard/focus contract
```

Never hand-write a component folder — `bun run scaffold` emits the seven-file
layout, the registry item and both barrels correctly by construction. See
`.agents/skills/qp-component-scaffold/SKILL.md`.

## The rules

Full standard in [`docs/standards/component-definition-of-done.md`](../../docs/standards/component-definition-of-done.md).
The short version:

- **It is a UI kit.** Every user-visible string, icon and dimension is a prop.
  This package ships no product copy.
- **Tailwind classes only.** No inline `style={{}}` except CSS custom
  properties. No hex, no `rgb()`, no `dark:` colour forks.
- **Token roles only** — `bg-surface-secondary`, `text-fg-muted`,
  `text-status-error`. Type comes from the ramp (`text-h2`, `text-body-sm`),
  never Tailwind's built-in sizes.
- **Logical properties** for direction (`ms-*`, `pe-*`, `text-start`). QPMatrix
  ships Arabic and Hebrew apps; no component needs an RTL fork.
- **Named React imports.** `import * as React` is lint-banned.
- **Relative imports.** `@/` never appears in committed source — `tsc --build`
  does not rewrite aliases on emit.
- **One component per folder**: `.tsx` (markup), `.types.ts`, `.constants.ts`,
  `.utils.ts`, `.test.tsx`, `.stories.tsx`, `index.ts`.
- **Accessibility failures block completion.** WCAG 2.2 AA, checked four ways:
  axe in tests, contrast at the token layer, a keyboard/focus contract, and
  Storybook's a11y addon in a real browser.

## Architecture

Why the registry exists, how the token adapter works, and why the primitives are
flat files: [`docs/architecture/shadcn-registry.md`](../../docs/architecture/shadcn-registry.md).

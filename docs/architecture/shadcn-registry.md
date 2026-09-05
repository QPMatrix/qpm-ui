# The QPMatrix shadcn Registry

`@qpmtx/ui` distributes components **two ways at once**, from one set of
files:

1. As a **published npm package** — `import { QPMetricCard } from "@qpmtx/ui"`.
2. As a **shadcn source registry** — `bunx --bun shadcn@latest add QPMatrix/qpm-ui/metric-card`,
   which copies the source into the consuming app.

This document explains why both exist, how they stay in agreement, and which
decisions are deliberate rather than incidental.

---

## Why two distribution modes

They serve genuinely different needs, and picking only one would break somebody:

**The npm package** is right when an app wants the component and does not want
to own it. It upgrades with `bun update`, its bugs are fixed centrally, and
nobody in the app is tempted to edit it.

**The source registry** is right when an app needs to _change_ the component —
a product-specific variant, a different empty state, an extra slot. shadcn's
whole premise is that a component you cannot edit eventually becomes a component
you work around, and the workaround is worse than the fork.

Shipping only npm forces every divergence into a `className` override or a
wrapper. Shipping only source means thirty copies drifting apart with no upgrade
path. Shipping both lets each consumer choose, per component.

## The layering

```
 @qpmtx/tokens          canonical design tokens.  Knows nothing about
        │                  CSS frameworks, React, or shadcn.
        ▼
 styles/qpmatrix.css       THE ADAPTER. Binds shadcn's variable names
        │                  (--background, --primary, --ring) to QPMatrix
        │                  semantic roles. Declares no literal values.
        ▼
 src/components/ui/*       shadcn/Base UI primitives, source-owned.
        │                  Installed by the shadcn CLI, unmodified where
        │                  possible so `shadcn update` keeps working.
        ▼
 src/components/<name>/    QPMatrix components. Compose the primitives.
                           Never re-implement them.
```

### The token architecture is canonical; shadcn's names are a vocabulary

This is the single most important rule in the package.

shadcn components reference `--background`, `--primary`, `--ring`, `--input`.
Those names are a **consumption vocabulary** so upstream components drop in
unmodified. They are **not** the design system. `@qpmtx/tokens` is, and its
roles (`--surface-primary`, `--brand-primary`, `--border-focus`) are the names
QPMatrix code writes.

`styles/qpmatrix.css` is the only place the two vocabularies meet, and it
contains exactly one alias block. If shadcn's naming ever became canonical,
every non-web target (React Native, desktop, email) would inherit a set of
web-CSS names that mean nothing there.

### Why the adapter's import order matters

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@qpmtx/tokens/css";
```

`@import "tailwindcss"` puts Tailwind's theme variables inside `@layer theme`.
`@qpmtx/tokens/css` is **unlayered**, and unlayered declarations beat layered
ones in the CSS cascade regardless of source order.

That is why `--radius-*` and `--font-sans` are deliberately **not** redeclared
in the adapter's `@theme` block: Tailwind's generated `rounded-md` already
resolves `var(--radius-md)`, and the tokens' unlayered value wins. So
`rounded-md` _is_ the QPMatrix radius, with zero duplication. Redeclaring them
inside `@theme inline` would create a `var()` reference cycle and silently blank
the property — a failure with no error message, which is why this is documented
rather than left to be rediscovered.

## The canonical schema, and why it is not shadcn's

`src/registry/schemas/registry-item.schema.ts` defines QPMatrix's own item
vocabulary, validated with zod:

| Field                                    | Why it exists                                                              |
| ---------------------------------------- | -------------------------------------------------------------------------- |
| `name`, `type`, `description`, `version` | Identity                                                                   |
| `files`                                  | What ships. Repo-root-relative, POSIX, no `..`                             |
| `dependencies`                           | npm packages the source imports at runtime                                 |
| `registryDependencies`                   | Other items a consumer must also install                                   |
| `aliases`                                | The consumer-side alias paths this item needs configured                   |
| `tokenDependencies`                      | Which `@qpmtx/tokens` roles it consumes                                    |
| `accessibility`                          | WCAG posture: audited/partial, interactive, keyboard-tested, focus-managed |
| `supportedPlatforms`                     | web / react-native / desktop / server                                      |
| `tags`                                   | Discovery                                                                  |

Seven canonical types — `component`, `primitive`, `hook`, `utility`, `pattern`,
`token-extension`, `form-pattern` — versus shadcn's `registry:ui`,
`registry:lib`, `registry:hook`, `registry:block`, `registry:theme`.

**shadcn's types are a projection target, not the vocabulary.** The mapping in
`utils/project-shadcn.ts` is deterministic:

```
component | primitive        -> registry:ui
hook                         -> registry:hook
utility                      -> registry:lib
pattern | form-pattern       -> registry:block
token-extension              -> registry:theme
```

The canonical set is richer because it answers questions shadcn's does not:
`tokenDependencies` tells an app what breaks if it drops a token;
`accessibility` tells a reviewer whether a component has actually been audited;
`supportedPlatforms` matters the moment a component is asked for on React
Native. Collapsing to five upstream names would throw all of that away. The
projection adapts — the canon never widens to fit it.

## Two manifests, and why

`bun run registry:build` emits **two** files:

- **`packages/ui/registry.json`** — paths relative to `packages/ui/`. This is
  what the shadcn CLI expects when `components.json` sits beside it.
- **`registry.json` at the repository root** — paths repo-root-relative.

The root one exists because **a GitHub source registry always resolves the
repository's ROOT `registry.json`**. `bunx shadcn add QPMatrix/qpm-ui/<item>`
fetches that file and nothing else, so a manifest that lived only under
`packages/ui/` would be invisible to every consumer. This is not a convenience
copy; it is the file consumers actually read.

Both are generated from `QP_REGISTRY_ITEMS` and **only after validation passes**,
so a broken registry cannot be published.

## The validator

`src/registry/utils/validate.ts` is one pure function of
`(registry, snapshot, tokenLookup)`. Every filesystem read happens in
`loadSnapshot()` first, which means the rules are unit-testable against a
hand-built snapshot and a validation run can never observe a half-changed tree.

| Rule                             | Catches                                        |
| -------------------------------- | ---------------------------------------------- |
| `schema`                         | An item that does not match the zod schema     |
| `duplicate-name`                 | Two items claiming the same name               |
| `missing-file`                   | A declared file that does not exist            |
| `unclaimed-file`                 | A shippable source file no item ships          |
| `unresolved-registry-dependency` | A dependency that is not a valid address       |
| `invalid-alias`                  | An alias that is not a `@/…` consumer path     |
| `no-alias-imports-in-source`     | A `@/` import that would survive `tsc` emit    |
| `banned-dependency`              | `@mui/*`, `@emotion/*` creeping back in        |
| `hardcoded-color`                | A literal colour bypassing the token system    |
| `unknown-token`                  | A declared token `@qpmtx/tokens` does not ship |
| `incomplete-token-dependencies`  | Tokens the source uses but does not declare    |
| `missing-accessibility`          | A missing or self-contradictory a11y block     |

`unclaimed-file` is the rule that makes the others meaningful: it means adding a
component without registering it is a **hard error** rather than a silent gap.

Two rules are deliberately narrower than they first appear:

- **`hardcoded-color` ignores comments**, CSS attribute selectors
  (`[stroke='#ccc']` — a selector matching a third-party library's markup, then
  replacing the colour with a token), and CSS Color 5 relative syntax derived
  from a token (`oklch(from var(--primary) …)` still tracks the token). Without
  those exclusions the rule fires on correct code, and a rule that cries wolf
  gets disabled.
- **`incomplete-token-dependencies` is a warning in one direction only.** A
  missing entry is always a real omission. An _extra_ entry is not, because an
  item may legitimately declare a token it consumes indirectly through a
  primitive it composes.

## Why relative imports, and why `@/` still exists

`components.json` and `tsconfig.json` both declare `@/*` → `./src/*`. This is
required: the shadcn CLI writes `@/` imports into every file it installs, and
editors need to resolve them.

But **committed `packages/ui` source must use relative imports**, because
`tsc --build` does **not** rewrite path aliases on emit. An `@/components/ui/button`
specifier would survive into `dist/` verbatim and fail at runtime for every npm
consumer, whose `@/` points at their own app.

So the workflow is: the CLI writes `@/`, and the aliases are rewritten to
relative on install. The `no-alias-imports-in-source` rule makes forgetting a
build failure rather than a runtime one for somebody else.

## Why the primitives are flat files

Every QPMatrix component is a folder (`<name>.tsx`, `.types.ts`, `.constants.ts`,
`.utils.ts`, tests, stories, barrel). The primitives under `src/components/ui/`
are **flat single files**, and that inconsistency is deliberate.

`src/components/ui/<name>.tsx` is the exact path the shadcn CLI writes to and
re-resolves on `shadcn update`. Restructuring them into folders would mean every
upstream upgrade either fails or silently re-creates the flat file alongside the
folder. The cost of the inconsistency is one paragraph of explanation; the cost
of "fixing" it is losing upstream updates permanently.

The public API hides the difference anyway: `src/index.ts` re-exports every
primitive under a `QP` name (`Button` → `QPButton`), so consumers see one
uniformly-prefixed surface while the source stays upgradeable.

## Adding an item

```sh
# A QPMatrix component — writes all seven files, the item, and both barrels
bun run scaffold -- --name status-pill --archetype passthrough --primitive badge

# A shadcn primitive the CLI just installed, which knows nothing about our registry
bunx --bun shadcn@latest add popover
bun run registry:create -- --name popover --type primitive \
  --files packages/ui/src/components/ui/popover.tsx

# Then, always
bun run registry:check status-pill
bun run registry:build
```

## Consuming

### The GitHub address form requires a PUBLIC repository

shadcn resolves `owner/repo/item` by fetching the repository's root
`registry.json` from `raw.githubusercontent.com` **without authentication**.
This repository is private, so that request 404s and the address form fails
with "Failed to read GitHub source file".

Verified directly:

```
curl -o /dev/null -w '%{http_code}' \
  https://raw.githubusercontent.com/QPMatrix/qpm-ui/main/registry.json
→ 404

gh api repos/QPMatrix/qpm-ui/contents/registry.json
→ registry.json 48675 bytes
```

The manifest is correct and complete — the transport is the problem. Making the
repository public is the only change needed; the manifests, addresses and
`registryDependencies` are already in the right form.

### What works today: a served registry

`registry:preview` is a real, installable registry, not just a viewer. It serves
per-item JSON at `/r/{name}.json` with file content inlined — the shape a hosted
registry returns — and rewrites local dependencies to the namespace you give it.

```sh
bun run --filter @qpmtx/ui registry:preview -- --namespace @qp
```

```jsonc
// the consuming app's components.json
{ "registries": { "@qp": "https://ui.qpmatrix.internal/r/{name}.json" } }
```

```sh
bunx --bun shadcn@latest add @qp/metric-card
```

This is the path proven end-to-end: thirteen components installed into a scratch
app with the real CLI, 62 files, all 121 relative imports resolving.

```sh
# Once the repository is public, this works too:
bunx --bun shadcn@latest add QPMatrix/qpm-ui/metric-card
```

```tsx
// Package: the app does not own the files
import { QPMetricCard } from "@qpmtx/ui";
```

```css
/* Either way, once at the app root */
@import "@qpmtx/ui/css";
```

## What is deliberately NOT here

- **No runtime registry.** Nothing reads `registry.json` at runtime; it is a
  build/install-time artefact. A component that looked itself up in a manifest
  would be unshakeable dead weight in every consumer's bundle.
- **No theme provider.** Dark is `:root` and light is `[data-theme="light"]`,
  both from `@qpmtx/tokens`, so switching themes is one attribute on `<html>`
  — settable server-side, with no hydration flash and no React context.
- **No `@qpmtx/tokens` coupling to CSS/React/shadcn.** The tokens package
  stays a plain data module. Everything web-specific lives in the adapter.

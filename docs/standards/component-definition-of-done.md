# Component Definition of Done

A component in `@qpmatrix/ui` is **done** when every item below is true. Not
"mostly true" — the list exists because each entry corresponds to a defect that
has actually shipped from a component that looked finished.

Two things make this list usable rather than aspirational:

- Most of it is **machine-checked**. `bun run registry:check <name>` runs the
  automatable half and exits non-zero if any of it fails.
- The rest is explicitly listed as **yours to confirm**, so nobody can quietly
  assume the tooling covered it.

---

## 1. Folder layout

Every QPMatrix component is a folder under `packages/ui/src/components/<kebab>/`
containing exactly these seven files:

| File                  | Holds                                         | Never holds                              |
| --------------------- | --------------------------------------------- | ---------------------------------------- |
| `<name>.tsx`          | Markup only                                   | `cva()` calls, branchy logic, prop types |
| `<name>.types.ts`     | Props interface, public unions                | Class strings, runtime values            |
| `<name>.constants.ts` | `cva` class maps, fixed values, fallback copy | Logic, JSX                               |
| `<name>.utils.ts`     | Pure helpers                                  | Hooks, DOM access, module state          |
| `<name>.test.tsx`     | The contract suite (§7)                       | —                                        |
| `<name>.stories.tsx`  | The preview (§8)                              | —                                        |
| `index.ts`            | Barrel re-exporting all four modules          | Implementation                           |

The split is not a preference. Markup, types, constants and logic change for
different reasons and are read by different people; a single 300-line `.tsx`
mixing a class map, a props interface and a keyboard predicate is what this
replaces.

`bun run scaffold -- --name <kebab> …` generates all seven correctly. For a
component that predates the layout, `bun run scaffold -- --name <kebab> --fill`
adds only what is missing and never touches an existing file.

**The shadcn primitives under `src/components/ui/` are exempt.** They are flat
files because that is the path contract the shadcn CLI writes to and re-resolves
on `shadcn update`; giving them folders would break every upstream upgrade.

## 2. It is a UI kit, not a screen

- **Every user-visible string is a prop.** No product copy ships in this
  package. Where a default string is genuinely unavoidable — a screen-reader-only
  status word — it must be overridable by a prop, and the prop must be
  documented as needing translation.
- **Every icon is a prop**, passed as an element (`<CheckIcon />`), never a
  string key.
- **Every dimension that a caller might reasonably need to change is a prop or a
  variant.** `className` covers layout; it is not a substitute for a missing prop.
- **No data fetching, no routing, no global state.** A component that knows
  where its data comes from cannot be reused by the next system.

## 3. Styling

- **Tailwind classes only.** No `style={{ … }}` objects. The single exception is
  a CSS custom property (`style={{ "--gap": spacing }}`) feeding an arbitrary
  property; ESLint enforces exactly this boundary.
- **Token roles only.** `bg-surface-secondary`, `text-fg-muted`,
  `border-border-default`, `text-status-error`. No hex, no `rgb()`, no `oklch()`
  literal. The registry's `hardcoded-color` rule fails the build otherwise.
- **Type comes from the ramp**, not Tailwind's built-in sizes: `text-h2`,
  `text-body-sm`, `text-label` — never `text-2xl` or `text-sm`, which know
  nothing about the QPMatrix scale.
- **No `dark:` colour forks.** Light mode already follows from
  `[data-theme="light"]` in `@qpmatrix/tokens`. A `dark:` colour override means
  the token is wrong.
- **Directional spacing is logical**: `ms-*`/`me-*`/`ps-*`/`pe-*`,
  `start-*`/`end-*`, `text-start`/`text-end`, `border-s`/`border-e`. QPMatrix
  ships Arabic and Hebrew apps; a component that needs an RTL fork is not done.
- **`cn()` merges `className` LAST**, so a consumer wins a tailwind-merge
  conflict.

## 4. Composition

- **Compose the primitives under `./ui/`; never hand-roll their markup.** If you
  are writing `<button>`, `<input>`, or card chrome in a component file, you are
  in the wrong file — extend or add a primitive first.
- **`...props` reaches the root element untouched**, including `ref` (an
  ordinary prop in React 19 — no `forwardRef` wrapper).
- **Element choice is a prop where it matters**, via Base UI's `render` (plus
  `nativeButton={false}` when the swapped element is not a button). Never invent
  an `as` prop whose only job is to swap the root.

## 5. Imports

- **Named React imports.** `import * as React from "react"` is lint-banned: it
  hides which React APIs a module actually depends on.
- **Relative imports.** `@/…` never appears in committed `packages/ui` source —
  `tsc --build` does not rewrite path aliases on emit, so the alias would
  survive into `dist/` and break for npm consumers. The registry's
  `no-alias-imports-in-source` rule enforces it.
- **No direct `@base-ui/react` or `motion/react` imports in app code.** Both are
  banned by `@qpmatrix/oxlint-config (react.json)` for the same reason: a primitive
  imported straight into an app is unstyled, untokenised and outside the
  accessibility gates this package applies.

## 6. Accessibility

This is the section that blocks completion. See
[`accessibility.md`](./accessibility.md) for the full standard.

- **Every interactive element is reachable and operable by keyboard alone**
  (SC 2.1.1), with no keyboard trap (SC 2.1.2).
- **Focus is never removed, only replaced** (SC 2.4.11/2.4.13). `outline-none`
  without a visible ring is a failure.
- **Every control has an accessible name** (SC 4.1.2). An icon-only control
  without one announces as "button" and nothing else.
- **Meaning never rests on colour alone** (SC 1.4.1). A status, a trend, a
  message author: each needs a second channel — text, an icon, a pattern.
- **No positive `tabindex`** (SC 2.4.3).
- **Motion is suppressible.** Anything animated must degrade under
  `prefers-reduced-motion: reduce` without losing information (SC 2.3.3). Use
  the `motion` components from this package, which handle it; a raw
  `motion.div` opts out silently.
- **Form controls have a real `<label>`**, not a placeholder (SC 3.3.2), and
  errors are announced and become the field's description (SC 3.3.1).
- **A `<section>` is only a landmark when it has an accessible name.** An
  unnamed one is an anonymous group, which is worse than a `<div>`.

## 7. Tests

`<name>.test.tsx` must cover, at minimum:

1. It renders the content it is given.
2. **Copy is a prop** — asserted with a non-Latin, RTL string, so nothing is
   hardcoding or transforming user-visible text.
3. Its `data-slot` is present, so consumers and tests can target it.
4. `className` merges last without clobbering the component's own classes.
5. Variants select **token-role classes**, not literal colours.
6. Unknown props and `ref` reach the root element.
7. **If interactive**: keyboard reachability, activation, disabled behaviour,
   and no positive tabindex.
8. **Every pure helper in `.utils.ts` is tested directly** — no render, no DOM.
   These are the branchy parts and the ones worth testing in isolation.
9. `runAxe(container)` reports zero violations in the default state.

Axe under happy-dom cannot evaluate colour contrast (there is no layout or
compositing), which is why contrast is checked at the token layer by
`bun run a11y:contrast` and again in the browser by Storybook's a11y addon.

## 8. Storybook

`<name>.stories.tsx` must have:

- `argTypes` for every prop a designer or engineer would drive from the panel.
  Controls are how "it accepts props" is _proven_ rather than claimed.
- A story per meaningful state — variants, sizes, loading, error, disabled.
- **An RTL story**, because RTL correctness is a claim this kit makes.
- `tags: ["autodocs"]`, so the TSDoc on each prop becomes the API table.

Run `bun run storybook` and confirm the a11y panel is clean for **every** story.

## 9. Registry

- A registry item exists at `packages/ui/src/registry/items/<name>.ts` and is
  listed in that directory's `index.ts`.
- `files` lists every shipped file (not the test or the stories).
- `dependencies`, `registryDependencies` and `tokenDependencies` match what the
  source actually imports and uses. The validator recomputes all three and fails
  on drift.
- The `accessibility` block is **honest**. `status: "audited"` means you ran the
  audit; `"partial"` means upstream owns the behaviour and you have not. This is
  the one field the validator cannot check for you, and the one where a lie is
  most expensive.

## 10. Gates

```sh
bun run registry:check <name>   # the machine-checkable half of this document
bun run check                   # build, typecheck, lint, test, registry, a11y
```

`registry:check` fails while any `TODO(scaffold)` marker survives, so a
scaffold can never be shipped unfinished.

---

## What the machine cannot check

`registry:check` prints these back at you on success, because they are the part
that requires a person:

- **The Storybook a11y panel is clean for every story**, not just the default.
- **The keyboard path was driven with a real keyboard**, not merely asserted in
  a test that could pass for the wrong reason.
- **The accessibility `notes` describe what you actually audited**, including
  what you did not.

A component whose tests pass and whose notes are aspirational is not done; it is
a component with a false claim attached to it in a file consumers read.

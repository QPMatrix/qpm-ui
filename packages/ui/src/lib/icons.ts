/**
 * `QPIcon` — the icon set this package already depends on, re-exported as
 * one namespace.
 *
 * `lucide-react` is a `dependencies` entry of `@qpmtx/ui` today (every
 * shadcn primitive that needs a glyph — `accordion`, `dialog`, `select`,
 * `checkbox`, …) already imports it, but nothing re-exported it to a
 * consumer. A component whose media/icon slot expects an element (`QPEmpty`'s
 * `EmptyMedia`, `QPIconButton`'s `children`) therefore forced a consuming app
 * to add its OWN icon dependency just to fill a slot this package already
 * ships an icon library for (QPMSEC-787).
 *
 * `export * as QPIcon` stays tree-shakeable: `lucide-react` publishes
 * `"sideEffects": false` and one ES module per icon, and every consumer here
 * reaches an icon through static property access — `<QPIcon.Inbox />` — which
 * Rollup/esbuild/webpack resolve back to the underlying named export and drop
 * every icon that is never referenced. Reaching an icon through a
 * DYNAMICALLY computed key (`QPIcon[iconName]`) defeats that analysis and
 * pulls the whole set into the bundle — never do that in a shipped component.
 *
 * ```tsx
 * import { QPIcon } from "@qpmtx/ui";
 *
 * <QPIcon.Inbox aria-hidden className="size-4" />
 * ```
 */
export * as QPIcon from "lucide-react";

import { clsx, type ClassValue } from "clsx";
import type { ReactNode } from "react";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The QPMatrix type ramp, as tailwind-merge knows it.
 *
 * This list is not decorative. tailwind-merge decides which of two conflicting
 * classes wins by first deciding what GROUP each belongs to, and it only knows
 * Tailwind's built-in scales. `text-body` and `text-fg-primary` both start
 * `text-`, so out of the box it classifies them as the same group — a font
 * size and a colour — and silently drops one. The visible symptom is a
 * heading that renders at body size for no apparent reason.
 *
 * Keep in sync with the `--text-*` entries in `styles/qpmatrix.css`.
 */
const QP_FONT_SIZES = [
  "display-lg",
  "display-md",
  "h1",
  "h2",
  "h3",
  "h4",
  "body-lg",
  "body",
  "body-sm",
  "label-lg",
  "label",
  "label-sm",
  "caption",
  "code",
  "metric-lg",
  "metric-compact",
] as const;

/**
 * Semantic colour roles that appear after a `text-` / `bg-` / `border-` /
 * `ring-` prefix. Listed for the same reason as the sizes: `text-fg-primary`
 * must be recognised as a COLOUR so it conflicts with other colours and not
 * with a font size.
 */
const QP_COLOR_ROLES = [
  "fg-primary",
  "fg-secondary",
  "fg-muted",
  "fg-subtle",
  "fg-disabled",
  "fg-inverse",
  "surface-primary",
  "surface-secondary",
  "surface-tertiary",
  "surface-interactive",
  "surface-selected",
  "surface-disabled",
  "border-subtle",
  "border-default",
  "border-strong",
  "border-interactive",
  "border-selected",
  "border-focus",
  "brand-primary",
  "brand-strong",
  "brand-subtle",
  "brand-foreground",
  "status-success",
  "status-warning",
  "status-error",
  "status-info",
  "status-offline",
  "status-success-bg",
  "status-warning-bg",
  "status-error-bg",
  "status-info-bg",
  "signal-live",
  "signal-connected",
  "signal-processing",
] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [...QP_FONT_SIZES] }],
      "text-color": [{ text: [...QP_COLOR_ROLES] }],
      "bg-color": [{ bg: [...QP_COLOR_ROLES] }],
      "border-color": [{ border: [...QP_COLOR_ROLES] }],
      "ring-color": [{ ring: [...QP_COLOR_ROLES] }],
      "font-family": [{ font: ["sans", "display", "mono", "arabic", "hebrew"] }],
    },
  },
});

/**
 * Merge Tailwind class names, with later classes winning conflicts.
 *
 * The one styling escape hatch @qpmatrix/ui components expose: every component
 * takes `className` and runs it through `cn()` last, so a consumer can adjust
 * *layout* (margin, width, grid placement) without being able to accidentally
 * end up with two competing `bg-*` classes. Consumers must not use it to
 * override colour or typography — that is what the token roles are for
 * (docs/standards/shared-ui.md, "Token usage rules").
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Is this node worth rendering a wrapper element for?
 *
 * Every optional slot in the kit — a timestamp, a trend, an action, a hint —
 * has to answer the same question before emitting its container, and every
 * component would otherwise inline the same three-way comparison. Getting it
 * wrong is not cosmetic: an absent slot that still renders its `<span>` leaves
 * an empty element in the accessibility tree and breaks `:empty`-based layout.
 *
 * `undefined` and `null` are what React drops silently; `false` is included
 * because `condition && <Thing />` is the idiom callers actually write, and it
 * evaluates to `false`, not `null`. Zero and empty string are deliberately
 * NOT excluded — `0` is a legitimate metric value.
 */
export function isRenderable(node: ReactNode): boolean {
  return node !== undefined && node !== null && node !== false;
}

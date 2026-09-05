import { cva } from "class-variance-authority";

import type { QPTextFont, QPTextTone, QPTextVariant } from "./text.types";

/**
 * QPText — class maps and fixed values.
 *
 * Each `text-*` class here is a QPMatrix ramp step declared in
 * `styles/qpmatrix.css`, NOT one of Tailwind's built-in sizes. `text-h2`
 * carries h2's size, line-height, tracking and weight in one utility;
 * `text-2xl` carries a size and nothing else and knows nothing about the
 * QPMatrix type system. Components must never reach for the built-in scale.
 */

/** Type ramp steps, keyed by public variant name. */
export const QP_TEXT_VARIANT_CLASSES = {
  "display-lg": "text-display-lg font-display",
  "display-md": "text-display-md font-display",
  h1: "text-h1 font-display",
  h2: "text-h2 font-display",
  h3: "text-h3",
  h4: "text-h4",
  "body-lg": "text-body-lg",
  body: "text-body",
  "body-sm": "text-body-sm",
  "label-lg": "text-label-lg",
  label: "text-label",
  "label-sm": "text-label-sm",
  caption: "text-caption",
  code: "text-code font-mono",
  // Metrics are tabular by definition: a dashboard figure that re-renders on
  // an interval jitters horizontally with proportional numerals, which reads
  // as the layout being broken rather than the number changing.
  "metric-lg": "text-metric-lg font-display tabular-nums",
  "metric-compact": "text-metric-compact tabular-nums",
} as const satisfies Record<QPTextVariant, string>;

/** Semantic colour roles. Token roles only — never a literal colour. */
export const QP_TEXT_TONE_CLASSES = {
  primary: "text-fg-primary",
  secondary: "text-fg-secondary",
  muted: "text-fg-muted",
  subtle: "text-fg-subtle",
  inverse: "text-fg-inverse",
  brand: "text-brand-primary",
  success: "text-status-success",
  warning: "text-status-warning",
  error: "text-status-error",
  info: "text-status-info",
} as const satisfies Record<QPTextTone, string>;

/**
 * Font families.
 *
 * `sans` is the empty string rather than `font-sans`: the body already sets
 * it, so emitting the class would only add a redundant declaration that a
 * consumer's `className` then has to fight through tailwind-merge.
 */
export const QP_TEXT_FONT_CLASSES = {
  sans: "",
  display: "font-display",
  mono: "font-mono",
  arabic: "font-arabic",
  hebrew: "font-hebrew",
} as const satisfies Record<QPTextFont, string>;

/** Line clamping. Tailwind needs the literal class, so the set is enumerated. */
export const QP_TEXT_CLAMP_CLASSES = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6",
} as const;

export const qpTextVariants = cva("", {
  variants: {
    variant: QP_TEXT_VARIANT_CLASSES,
    tone: QP_TEXT_TONE_CLASSES,
    align: {
      // Logical, so RTL flips without a second class.
      start: "text-start",
      center: "text-center",
      end: "text-end",
    },
    tabular: {
      true: "tabular-nums",
      false: "",
    },
  },
  defaultVariants: {
    variant: "body",
    tone: "primary",
    tabular: false,
  },
});

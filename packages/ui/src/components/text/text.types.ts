import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ElementType, ReactNode } from "react";

import type { qpTextVariants } from "./text.constants";

/**
 * QPText — public type surface.
 */

/**
 * The QPMatrix type ramp, straight from @qpmtx/tokens.
 *
 * Each name resolves to a Tailwind `text-*` utility that carries size, line
 * height, letter spacing AND weight together, so a type style cannot be
 * applied by halves.
 */
export type QPTextVariant =
  | "display-lg"
  | "display-md"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "body-lg"
  | "body"
  | "body-sm"
  | "label-lg"
  | "label"
  | "label-sm"
  | "caption"
  | "code"
  | "metric-lg"
  | "metric-compact";

/** Semantic colour roles text is allowed to take. */
export type QPTextTone =
  | "primary"
  | "secondary"
  | "muted"
  | "subtle"
  | "inverse"
  | "brand"
  | "success"
  | "warning"
  | "error"
  | "info";

/** Which token font family to render in. */
export type QPTextFont = "sans" | "display" | "mono" | "arabic" | "hebrew";

/**
 * Elements `QPText` may render as.
 *
 * Restricted on purpose: the whole point of separating `variant` (how it
 * LOOKS) from `as` (what it IS) is that a caller must choose both
 * deliberately. Leave headings to `QPHeading`, which enforces outline order.
 */
export type QPTextElement = Extract<
  ElementType,
  | "p"
  | "span"
  | "div"
  | "strong"
  | "em"
  | "small"
  | "code"
  | "kbd"
  | "label"
  | "dt"
  | "dd"
  | "figcaption"
  | "li"
>;

export interface QPTextProps
  extends Omit<ComponentProps<"p">, "children" | "className">, VariantProps<typeof qpTextVariants> {
  /** The type style. Defaults to `body`. */
  variant?: QPTextVariant;
  /** The element to render. Defaults to `p`. */
  as?: QPTextElement;
  /** Semantic colour. Defaults to `primary`. */
  tone?: QPTextTone;
  /**
   * Font family override. Defaults to the inherited `font-sans`.
   *
   * `arabic` and `hebrew` exist because @qpmtx/tokens ships script-specific
   * families with their own size and line-height adjustments — Arabic set at
   * a Latin font's metrics is legible but visibly cramped.
   */
  font?: QPTextFont;
  /** Clamp to N lines with an ellipsis. Omit for no clamping. */
  clamp?: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * Render figures at a fixed width so numbers do not jitter as they update.
   * Automatic for the `metric-*` variants.
   */
  tabular?: boolean;
  /** Text alignment. Uses logical values, so it flips under RTL. */
  align?: "start" | "center" | "end";
  /** Text content. */
  children?: ReactNode;
  className?: string | undefined;
}

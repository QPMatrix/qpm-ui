import { QP_TEXT_CLAMP_CLASSES, QP_TEXT_FONT_CLASSES } from "./text.constants";
import type { QPTextElement, QPTextFont, QPTextVariant } from "./text.types";

/**
 * QPText — pure helpers.
 */

/** The font-family class for an optional `font` prop. */
export function qpTextFontClass(font: QPTextFont | undefined): string {
  return font === undefined ? "" : QP_TEXT_FONT_CLASSES[font];
}

/** The line-clamp class for an optional `clamp` prop. */
export function qpTextClampClass(clamp: 1 | 2 | 3 | 4 | 5 | 6 | undefined): string {
  return clamp === undefined ? "" : QP_TEXT_CLAMP_CLASSES[clamp];
}

/**
 * The element a variant renders as when the caller does not say.
 *
 * This is a CONVENIENCE default, never a substitute for choosing. It maps a
 * variant to the most common correct element — `code` to `<code>`, `label` to
 * `<span>` (NOT `<label>`, which without an `htmlFor` is a broken form label
 * rather than small bold text). Heading variants deliberately still default to
 * `<p>`: a visual `h2` is not necessarily an outline-level 2, and silently
 * emitting `<h2>` would let a page's document outline be decided by whichever
 * type size a designer picked. Use `QPHeading` when the outline is the point.
 */
export function qpDefaultTextElement(variant: QPTextVariant): QPTextElement {
  switch (variant) {
    case "code":
      return "code";
    case "caption":
      return "figcaption";
    case "label":
    case "label-lg":
    case "label-sm":
      // A <span>, NOT a <label>: a `<label>` without `htmlFor` is a broken
      // form label rather than small bold text.
      return "span";
    // Every remaining step is body copy or a heading-shaped visual, and both
    // default to a paragraph. Listed exhaustively rather than caught by a
    // `default` arm so that ADDING a ramp step is a compile error until
    // somebody decides what element it should be.
    case "display-lg":
    case "display-md":
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "body-lg":
    case "body":
    case "body-sm":
    case "metric-lg":
    case "metric-compact":
      return "p";
  }
}

import type { QPHeadingLevel, QPHeadingTag, QPHeadingVariant } from "./heading.types";

/**
 * QPHeading — class maps and fixed values.
 */

/**
 * The type ramp step each outline level looks like by DEFAULT.
 *
 * A default, not a rule: `variant` overrides it. It exists so the common case
 * — outline level and visual weight agreeing — needs one prop instead of two,
 * which is what stops people from reaching for a bare `<h3>` to get the size
 * they wanted.
 *
 * Levels 5 and 6 map to `label`: below h4 the QPMatrix ramp has no larger
 * step, and inventing one here would put a size in a component that does not
 * exist in the tokens.
 */
export const QP_HEADING_LEVEL_VARIANTS = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "label",
  6: "label",
} as const satisfies Record<QPHeadingLevel, QPHeadingVariant>;

/** `level` to the tag it renders. */
export const QP_HEADING_TAGS = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
} as const satisfies Record<QPHeadingLevel, QPHeadingTag>;

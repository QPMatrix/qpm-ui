import { QP_HEADING_LEVEL_VARIANTS, QP_HEADING_TAGS } from "./heading.constants";
import type { QPHeadingLevel, QPHeadingTag, QPHeadingVariant } from "./heading.types";

/**
 * QPHeading — pure helpers.
 */

/** The ramp step to render at, honouring an explicit `variant`. */
export function qpHeadingVariant(
  level: QPHeadingLevel,
  variant: QPHeadingVariant | undefined,
): QPHeadingVariant {
  return variant ?? QP_HEADING_LEVEL_VARIANTS[level];
}

/**
 * The tag to emit.
 *
 * `plain` yields a `<span>`, which keeps the type style but contributes
 * nothing to the document outline — the deliberate escape hatch for text that
 * merely looks like a heading.
 */
export function qpHeadingTag(level: QPHeadingLevel, plain: boolean): QPHeadingTag {
  return plain ? "span" : QP_HEADING_TAGS[level];
}

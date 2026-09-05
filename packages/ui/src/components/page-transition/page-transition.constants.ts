import type { QPDurationName, QPVariantName } from "../../lib/motion/motion-core.constants";

/**
 * QPPageTransition — fixed values.
 */

/**
 * A cross-fade, not a slide.
 *
 * A whole page sliding is a large amount of movement on every navigation, and
 * it implies a spatial relationship between routes that a link usually does
 * not have. Fading says "this is different content" without claiming it came
 * from somewhere.
 */
export const QP_PAGE_TRANSITION_VARIANT: QPVariantName = "fade";

/** Slower than in-page motion: a whole surface is changing. */
export const QP_PAGE_TRANSITION_DURATION: QPDurationName = "slow";

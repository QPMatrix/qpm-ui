import type { QPVariantName } from "../../lib/motion/motion-core.constants";

/**
 * QPReveal — fixed values.
 */

/** Longer travel and a slower settle than QPMotion: a whole block arriving. */
export const QP_REVEAL_DEFAULT_VARIANT: QPVariantName = "reveal";

/**
 * Fraction of the element that must be on screen before it plays.
 *
 * 0.2 rather than a token amount: this is a scroll threshold, not a design
 * value, and it is chosen so the reader has clearly ARRIVED at the block
 * rather than merely grazed its top edge — which on a tall section can happen
 * a full screen before they can read any of it.
 */
export const QP_REVEAL_DEFAULT_AMOUNT = 0.2;

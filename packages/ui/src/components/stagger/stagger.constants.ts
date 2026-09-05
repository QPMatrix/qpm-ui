import type { QPStaggerName } from "../../lib/motion/motion-core.constants";

/**
 * QPStagger — fixed values.
 */

/** 60ms between children: right for a grid of cards, the common case. */
export const QP_STAGGER_DEFAULT: QPStaggerName = "normal";

/** Matches QPReveal, so a staggered group and a revealed block fire together. */
export const QP_STAGGER_DEFAULT_AMOUNT = 0.2;

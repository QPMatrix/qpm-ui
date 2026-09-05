import type { QPVariantName } from "../../lib/motion/motion-core.constants";

/**
 * QPMotion — fixed values.
 *
 * The vocabulary itself (durations, easings, the named variants) is shared and
 * lives in `src/lib/motion`. Only this component's own defaults belong here.
 */

/**
 * `rise` — fade while settling upward — is the default because it is the
 * quietest entrance that still reads as arrival. `fade` says nothing about
 * where content came from; `pop` says far more than most content deserves.
 */
export const QP_MOTION_DEFAULT_VARIANT: QPVariantName = "rise";

/** A block-level `div` unless the document needs something else. */
export const QP_MOTION_DEFAULT_ELEMENT = "div" as const;

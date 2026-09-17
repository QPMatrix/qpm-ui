import {
  qpEffectiveReducedMotion,
  qpResolveTransition,
  qpResolveVariants,
} from "../../lib/motion/motion-core.utils";

/**
 * QPMotion — pure helpers.
 *
 * All three are re-exported from the shared foundation rather than
 * reimplemented: the four motion components must resolve variants,
 * transitions and the reduced-motion decision IDENTICALLY, or a section and
 * the card inside it settle on different curves and the page stops feeling
 * like one surface.
 */
export { qpEffectiveReducedMotion, qpResolveTransition, qpResolveVariants };

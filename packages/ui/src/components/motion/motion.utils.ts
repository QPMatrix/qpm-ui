import { qpResolveTransition, qpResolveVariants } from "../../lib/motion/motion-core.utils";

/**
 * QPMotion — pure helpers.
 *
 * Both are re-exported from the shared foundation rather than reimplemented:
 * the four motion components must resolve variants and transitions
 * IDENTICALLY, or a section and the card inside it settle on different curves
 * and the page stops feeling like one surface.
 */
export { qpResolveTransition, qpResolveVariants };

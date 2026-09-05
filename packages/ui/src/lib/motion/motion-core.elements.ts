import { motion } from "motion/react";
import type { ElementType } from "react";

import type { QPMotionElement } from "./motion-core.types";

/**
 * Motion-wrapped elements, created ONCE at module scope.
 *
 * `motion.create(as)` inside a render body returns a NEW component identity on
 * every render, so React unmounts the previous subtree and mounts a fresh one
 * each time the parent updates — losing focus, scroll position, input state
 * and any animation in flight. Looking the element up in a static map avoids
 * that entirely.
 *
 * The map also constrains `as` to elements that are sensible to animate as a
 * block, which the `QPMotionElement` type mirrors. It lives in `lib/` rather
 * than in a component folder because all four motion components share it.
 */
const QP_MOTION_ELEMENTS = {
  div: motion.div,
  span: motion.span,
  section: motion.section,
  article: motion.article,
  li: motion.li,
  ul: motion.ul,
  ol: motion.ol,
  header: motion.header,
  footer: motion.footer,
  nav: motion.nav,
  main: motion.main,
  p: motion.p,
} as const;

/**
 * Resolve `as` to its motion component.
 *
 * The return type is WIDENED to `ElementType`, not asserted to one member.
 * The union `motion.div | motion.li | …` has an INTERSECTION of prop types —
 * `onCopy`'s handler is typed per element — so JSX would reject props every
 * member actually accepts. Widening is an ordinary assignment: each value
 * genuinely is an `ElementType`. What a caller may pass is still constrained
 * by `QPMotionProps`, which is where the real check belongs.
 */
export function qpMotionElement(as: QPMotionElement): ElementType {
  return QP_MOTION_ELEMENTS[as];
}

export { QP_MOTION_ELEMENTS };

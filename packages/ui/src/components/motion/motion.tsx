"use client";

import { useReducedMotion } from "motion/react";

import { cn } from "../../lib/utils";
import { qpMotionElement } from "../../lib/motion/motion-core.elements";
import { QP_MOTION_DEFAULT_ELEMENT, QP_MOTION_DEFAULT_VARIANT } from "./motion.constants";
import type { QPMotionProps } from "./motion.types";
import { qpResolveTransition, qpResolveVariants } from "./motion.utils";

/**
 * QPMotion — animate an element in (and out) where it stands.
 *
 * The general-purpose wrapper: content that appears, a panel that opens, a row
 * that is inserted. For content arriving on scroll use `QPReveal`; for a group
 * arriving in sequence use `QPStagger`; for a whole route use
 * `QPPageTransition`.
 *
 * It exists instead of `motion.div` at call sites for one reason: it calls
 * `useReducedMotion()` and strips the movement when the user has asked for
 * less. An app reaching for `motion.div` directly gets none of that, and the
 * omission is invisible until somebody who needs it opens the page. WCAG 2.2
 * SC 2.3.3 is not something to remember per call site.
 *
 * ```tsx
 * <QPMotion variant="rise" as="section">
 *   <QPHeading level={2}>Pipelines</QPHeading>
 * </QPMotion>
 * ```
 */
export function QPMotion({
  variant = QP_MOTION_DEFAULT_VARIANT,
  as = QP_MOTION_DEFAULT_ELEMENT,
  delay,
  duration,
  ease,
  transition,
  className,
  children,
  ...props
}: QPMotionProps) {
  const shouldReduceMotion = useReducedMotion();
  const Component = qpMotionElement(as);

  return (
    <Component
      data-slot="motion"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={qpResolveVariants(variant, shouldReduceMotion)}
      transition={qpResolveTransition({ duration, ease, transition, delay })}
      className={cn(className)}
      {...props}
    >
      {children}
    </Component>
  );
}

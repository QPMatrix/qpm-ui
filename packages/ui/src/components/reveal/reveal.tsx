"use client";

import { useReducedMotion } from "motion/react";

import { cn } from "../../lib/utils";
import { qpMotionElement } from "../../lib/motion/motion-core.elements";
import { qpResolveTransition, qpResolveVariants } from "../../lib/motion/motion-core.utils";
import { QP_REVEAL_DEFAULT_AMOUNT, QP_REVEAL_DEFAULT_VARIANT } from "./reveal.constants";
import type { QPRevealProps } from "./reveal.types";
import { qpRevealViewport } from "./reveal.utils";

/**
 * QPReveal — animate an element in as it scrolls into view.
 *
 * This is what makes a long page feel alive rather than pre-assembled: content
 * arrives as the reader reaches it, instead of the whole document having
 * obviously been there all along.
 *
 * It plays ONCE by default. Replaying on every re-entry makes a page feel
 * unstable and punishes scrolling back — see `repeat` if you genuinely need it.
 * Under `prefers-reduced-motion: reduce` the movement is removed entirely and
 * only a cross-fade remains.
 */
export function QPReveal({
  variant = QP_REVEAL_DEFAULT_VARIANT,
  as = "div",
  amount = QP_REVEAL_DEFAULT_AMOUNT,
  repeat = false,
  delay,
  duration,
  ease,
  transition,
  className,
  children,
  ...props
}: QPRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const Component = qpMotionElement(as);

  return (
    <Component
      data-slot="reveal"
      initial="hidden"
      whileInView="visible"
      viewport={qpRevealViewport({ repeat, amount })}
      variants={qpResolveVariants(variant, shouldReduceMotion)}
      transition={qpResolveTransition({ duration, ease, transition, delay })}
      className={cn(className)}
      {...props}
    >
      {children}
    </Component>
  );
}

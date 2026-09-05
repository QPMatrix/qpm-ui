"use client";

import { useReducedMotion } from "motion/react";

import { cn } from "../../lib/utils";
import { qpMotionElement } from "../../lib/motion/motion-core.elements";
import { qpStaggerVariants } from "../../lib/motion/motion-core.utils";
import { QP_STAGGER_DEFAULT } from "./stagger.constants";
import type { QPStaggerProps } from "./stagger.types";
import { qpStaggerTrigger } from "./stagger.utils";

/**
 * QPStagger — orchestrate children so they arrive in sequence.
 *
 * The children must be `QPMotion` (or any motion element using the same
 * variant names). This component sets no `initial`/`animate` on them — it only
 * TIMES them — which is what lets one component stagger a grid of cards, a
 * list of table rows and a set of page sections alike.
 *
 * ```tsx
 * <QPStagger as="ul" stagger="tight" whenVisible>
 *   {rows.map((row) => (
 *     <QPMotion key={row.id} as="li" variant="rise">{row.label}</QPMotion>
 *   ))}
 * </QPStagger>
 * ```
 *
 * Under reduced motion the step collapses to zero, so every child still
 * appears — just all at once, with no sweep down the page.
 */
export function QPStagger({
  as = "div",
  stagger = QP_STAGGER_DEFAULT,
  reverse,
  whenVisible = false,
  amount,
  delay,
  className,
  children,
  ...props
}: QPStaggerProps & { amount?: number }) {
  const shouldReduceMotion = useReducedMotion();
  const Component = qpMotionElement(as);

  return (
    <Component
      data-slot="stagger"
      initial="hidden"
      variants={qpStaggerVariants({ stagger, reverse, delay, shouldReduceMotion })}
      {...qpStaggerTrigger({ whenVisible, amount })}
      exit="exit"
      className={cn(className)}
      {...props}
    >
      {children}
    </Component>
  );
}

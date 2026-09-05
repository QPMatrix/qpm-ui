"use client";

import { AnimatePresence, useReducedMotion } from "motion/react";

import { cn } from "../../lib/utils";
import { qpMotionElement } from "../../lib/motion/motion-core.elements";
import { qpResolveTransition, qpResolveVariants } from "../../lib/motion/motion-core.utils";
import {
  QP_PAGE_TRANSITION_DURATION,
  QP_PAGE_TRANSITION_VARIANT,
} from "./page-transition.constants";
import type { QPPageTransitionProps } from "./page-transition.types";

/**
 * QPPageTransition — cross-fade a whole route.
 *
 * `pageKey` must CHANGE on navigation — pass the pathname. React reuses the
 * same element across routes otherwise, so nothing unmounts, so the exit
 * animation never runs and the transition silently does nothing at all.
 *
 * `mode="wait"` holds the incoming page until the outgoing one has left. The
 * alternative — both on screen at once — means two full pages of content
 * overlapping mid-scroll, which is louder than any navigation deserves.
 *
 * `initial={false}` suppresses the animation on FIRST paint: a page that fades
 * in on hard load delays the content the user came for, and on a server-rendered
 * app it produces a visible flash of correctly-rendered-then-hidden content.
 */
export function QPPageTransition({
  pageKey,
  variant = QP_PAGE_TRANSITION_VARIANT,
  as = "main",
  duration = QP_PAGE_TRANSITION_DURATION,
  ease,
  transition,
  className,
  children,
  ...props
}: QPPageTransitionProps) {
  const shouldReduceMotion = useReducedMotion();
  const Component = qpMotionElement(as);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Component
        key={pageKey}
        data-slot="page-transition"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={qpResolveVariants(variant, shouldReduceMotion)}
        transition={qpResolveTransition({ duration, ease, transition })}
        className={cn(className)}
        {...props}
      >
        {children}
      </Component>
    </AnimatePresence>
  );
}

/**
 * Re-exported so an app can mount an exit-animating list or dialog without
 * taking its own direct dependency on `motion` — which the ESLint config bans
 * for the same reason it bans importing Base UI directly.
 */
export { AnimatePresence as QPAnimatePresence, useReducedMotion as useQPReducedMotion };

import type { Transition, Variants } from "motion/react";

import {
  QP_DURATION,
  QP_EASE,
  QP_STAGGER,
  QP_TRANSITION,
  QP_VARIANTS,
  type QPDurationName,
  type QPEaseName,
  type QPStaggerName,
  type QPVariantName,
} from "./motion-core.constants";

/**
 * The QPMatrix motion system — pure helpers.
 *
 * These take the props a caller wrote and turn them into the objects Motion
 * wants. They are pure and exported so the resolution rules can be tested
 * directly, without rendering anything — which matters, because "does
 * reduced-motion actually strip the movement?" is the question most likely to
 * regress and the hardest to see in a browser.
 */

/**
 * Collapse a variant set to opacity-only, or to nothing at all.
 *
 * This is the single most important function in the motion system.
 *
 * `prefers-reduced-motion: reduce` is set by people who get motion sickness,
 * vertigo or migraines from movement — it is an accessibility setting, not a
 * performance one, and WCAG 2.2 SC 2.3.3 (Animation from Interactions) is
 * explicit that motion which is not essential must be removable. So under
 * reduce we do NOT play a shorter version of the same animation: we remove
 * the movement entirely.
 *
 * A cross-fade is kept rather than snapping to the final state, because an
 * opacity change involves no vestibular motion and still tells the user
 * something arrived. Passing `stripAll` removes even that, for a caller that
 * needs a hard cut.
 */
export function qpReduceVariants(variants: Variants, stripAll = false): Variants {
  if (stripAll) {
    return {
      hidden: { opacity: 1 },
      visible: { opacity: 1 },
      exit: { opacity: 1 },
    };
  }

  const reduced: Variants = {};
  for (const [state, definition] of Object.entries(variants)) {
    if (typeof definition !== "object" || definition === null || Array.isArray(definition)) {
      reduced[state] = definition;
      continue;
    }
    // Keep opacity; drop every transform. `height` is dropped too: a collapse
    // is a size change the user's eye tracks as movement down the page.
    const { opacity } = definition as { opacity?: number };
    reduced[state] = opacity === undefined ? {} : { opacity };
  }
  return reduced;
}

/**
 * Build the transition a component should use, in override order:
 * the variant's own transition → a token duration → a token easing → the
 * caller's raw `transition` object → the delay.
 *
 * The delay is applied LAST and unconditionally, because a stagger parent
 * computes it per child and must not have it silently replaced by a variant's
 * built-in transition.
 */
export function qpResolveTransition(options: {
  duration?: QPDurationName | undefined;
  ease?: QPEaseName | undefined;
  transition?: Transition | undefined;
  delay?: number | undefined;
}): Transition {
  const resolved: Transition = { ...QP_TRANSITION };

  if (options.duration !== undefined) {
    resolved.duration = QP_DURATION[options.duration];
  }
  if (options.ease !== undefined) {
    resolved.ease = QP_EASE[options.ease];
  }
  if (options.transition !== undefined) {
    Object.assign(resolved, options.transition);
  }
  if (options.delay !== undefined && options.delay !== 0) {
    resolved.delay = options.delay;
  }

  return resolved;
}

/**
 * The variants for a named motion, already reduced if the user asked for less.
 *
 * Returning a fresh object each call is intentional: Motion mutates nothing,
 * but a shared object handed to many elements makes it far too easy for one
 * component's `transition` override to leak into every other user of the same
 * variant name.
 */
export function qpResolveVariants(
  variant: QPVariantName,
  shouldReduceMotion: boolean | null,
): Variants {
  const base = QP_VARIANTS[variant];
  return shouldReduceMotion === true ? qpReduceVariants(base) : { ...base };
}

/**
 * The parent variants that orchestrate a stagger.
 *
 * The parent itself animates nothing — it exists purely to time its children.
 * `staggerDirection: -1` plays the last child first, which is what a
 * bottom-anchored list (a chat log) needs so the newest message leads.
 */
export function qpStaggerVariants(options: {
  stagger?: QPStaggerName | undefined;
  reverse?: boolean | undefined;
  delay?: number | undefined;
  shouldReduceMotion: boolean | null;
}): Variants {
  // Under reduce, children still appear — they just all appear at once.
  // Staggering opacity would still read as movement down the page.
  const step = options.shouldReduceMotion === true ? 0 : QP_STAGGER[options.stagger ?? "normal"];

  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: step,
        staggerDirection: options.reverse === true ? -1 : 1,
        delayChildren: options.delay ?? 0,
      },
    },
    exit: {
      transition: { staggerChildren: step / 2, staggerDirection: -1 },
    },
  };
}

import type { Transition, Variants } from "motion/react";

/**
 * The QPMatrix motion system — durations, easings, springs and variants.
 *
 * Motion here is not decoration bolted onto finished components. It is a
 * *system*, defined once, so that a page transition, a section revealing on
 * scroll and a button responding to a press all read as the same surface
 * moving rather than three libraries fighting. Every number below resolves
 * from @qpmatrix/tokens, which is also what `styles/qpmatrix.css` feeds to
 * Tailwind's `duration-*` / `ease-*` utilities — so a CSS transition and a
 * Motion animation on the same element agree by construction.
 *
 * Two rules this file exists to enforce:
 *
 *   1. NOTHING here is a bare number. A duration invented at a call site is
 *      how a design system stops feeling designed.
 *   2. Motion carries no information. Every animated state must also be
 *      readable when the animation does not run — see `src/motion/motion.utils.ts`,
 *      which collapses all of this under `prefers-reduced-motion: reduce`.
 */

/**
 * Token durations, in SECONDS.
 *
 * Motion takes seconds; @qpmatrix/tokens stores CSS milliseconds. Converting
 * once, here, is what stops `0.28` and `280ms` from drifting apart the first
 * time somebody tunes the token.
 */
export const QP_DURATION = {
  /** 80ms — a state flip the user should not perceive as motion at all. */
  instant: 0.08,
  /** 160ms — hover, press, focus. Micro-interactions. */
  fast: 0.16,
  /** 280ms — the default. Entering, leaving, expanding. */
  standard: 0.28,
  /** 450ms — a whole page or panel changing. */
  slow: 0.45,
  /** 2400ms — ambient, looping, never blocking. */
  ambient: 2.4,
  /** 3600ms — background flow (gradients, drifting glows). */
  flow: 3.6,
} as const;

export type QPDurationName = keyof typeof QP_DURATION;

/**
 * Token easings as Motion cubic-bezier arrays.
 *
 * The literal control points mirror `--ease-*` in @qpmatrix/tokens exactly.
 * `standard` and `out` are both strongly decelerating (a long tail) because
 * that is what makes an interface feel like it settles rather than stops.
 */
export const QP_EASE = {
  /** cubic-bezier(0.22, 1, 0.36, 1) — the default for anything entering. */
  standard: [0.22, 1, 0.36, 1],
  /** cubic-bezier(0.16, 1, 0.3, 1) — a longer, softer settle. */
  out: [0.16, 1, 0.3, 1],
  /** cubic-bezier(0.4, 0, 1, 1) — accelerating. Use only for exits. */
  in: [0.4, 0, 1, 1],
  /** cubic-bezier(0.65, 0, 0.35, 1) — symmetric. Use for reversible moves. */
  inOut: [0.65, 0, 0.35, 1],
} as const satisfies Record<string, [number, number, number, number]>;

export type QPEaseName = keyof typeof QP_EASE;

/**
 * The spring, from `--spring-stiffness` / `--spring-damping`.
 *
 * Springs are for things the user is DIRECTLY manipulating — a dragged panel,
 * a toggle thumb, a popover tracking its trigger — where a fixed duration
 * feels detached from the input. Everything else uses a duration + easing,
 * which is more predictable and cheaper to reason about.
 */
export const QP_SPRING = {
  type: "spring",
  stiffness: 260,
  damping: 30,
  mass: 1,
} as const satisfies Transition;

/** A snappier spring for small, high-frequency movements (thumbs, chips). */
export const QP_SPRING_SNAPPY = {
  type: "spring",
  stiffness: 420,
  damping: 32,
  mass: 0.6,
} as const satisfies Transition;

/** The default transition: standard duration, standard easing. */
export const QP_TRANSITION: Transition = {
  duration: QP_DURATION.standard,
  ease: QP_EASE.standard,
};

/** The transition for micro-interactions — hover, press, focus. */
export const QP_TRANSITION_FAST: Transition = {
  duration: QP_DURATION.fast,
  ease: QP_EASE.standard,
};

/** The transition for whole-surface changes — pages, panels, dialogs. */
export const QP_TRANSITION_SLOW: Transition = {
  duration: QP_DURATION.slow,
  ease: QP_EASE.out,
};

/**
 * How far an element travels when it rises into place, in pixels.
 *
 * Deliberately small. A 12px rise reads as "this settled"; a 60px rise reads
 * as "this flew in from somewhere", which is a different and much louder
 * statement, and one that makes long pages feel busy when every section does it.
 */
export const QP_TRAVEL = {
  /** 6px — a nudge. Tooltips, menus, chips. */
  sm: 6,
  /** 12px — the default for content entering. */
  md: 12,
  /** 24px — a whole section arriving. */
  lg: 24,
} as const;

export type QPTravelName = keyof typeof QP_TRAVEL;

/**
 * The named motion vocabulary.
 *
 * Everything animated in the kit picks one of these rather than writing its
 * own `initial`/`animate` pair, so "how does content enter on a QPMatrix
 * surface?" has exactly one answer per intent.
 */
export const QP_VARIANTS = {
  /** Opacity only. The safest entrance; use when position must not shift. */
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: QP_TRANSITION },
    exit: { opacity: 0, transition: QP_TRANSITION_FAST },
  },

  /** Fade while settling upward. The default for content entering. */
  rise: {
    hidden: { opacity: 0, y: QP_TRAVEL.md },
    visible: { opacity: 1, y: 0, transition: QP_TRANSITION },
    exit: { opacity: 0, y: QP_TRAVEL.sm, transition: QP_TRANSITION_FAST },
  },

  /** A whole section arriving on scroll. Longer travel, slower settle. */
  reveal: {
    hidden: { opacity: 0, y: QP_TRAVEL.lg },
    visible: { opacity: 1, y: 0, transition: QP_TRANSITION_SLOW },
    exit: { opacity: 0, transition: QP_TRANSITION_FAST },
  },

  /**
   * Scale from just-under-full. Never from 0: a card growing out of nothing
   * draws far more attention than the content usually deserves, and reads as
   * an error state when it happens on every render.
   */
  pop: {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1, transition: QP_SPRING_SNAPPY },
    exit: { opacity: 0, scale: 0.98, transition: QP_TRANSITION_FAST },
  },

  /** Enters from the inline-start edge. Logical, so it flips under RTL. */
  slideStart: {
    hidden: { opacity: 0, x: -QP_TRAVEL.lg },
    visible: { opacity: 1, x: 0, transition: QP_TRANSITION },
    exit: { opacity: 0, x: -QP_TRAVEL.sm, transition: QP_TRANSITION_FAST },
  },

  /** Enters from the inline-end edge. */
  slideEnd: {
    hidden: { opacity: 0, x: QP_TRAVEL.lg },
    visible: { opacity: 1, x: 0, transition: QP_TRANSITION },
    exit: { opacity: 0, x: QP_TRAVEL.sm, transition: QP_TRANSITION_FAST },
  },

  /** Height collapse. For disclosure, accordions, expanding rows. */
  collapse: {
    hidden: { opacity: 0, height: 0, transition: QP_TRANSITION_FAST },
    visible: { opacity: 1, height: "auto", transition: QP_TRANSITION },
    exit: { opacity: 0, height: 0, transition: QP_TRANSITION_FAST },
  },
} as const satisfies Record<string, Variants>;

export type QPVariantName = keyof typeof QP_VARIANTS;

/**
 * Stagger timings for a parent orchestrating children.
 *
 * The delays are short on purpose: a list of twelve rows at 120ms each takes
 * a second and a half to finish, by which point the user has already started
 * reading and the motion is just in the way.
 */
export const QP_STAGGER = {
  /** 30ms between children — dense lists, table rows. */
  tight: 0.03,
  /** 60ms — cards in a grid. The default. */
  normal: 0.06,
  /** 100ms — a handful of large sections. */
  loose: 0.1,
} as const;

export type QPStaggerName = keyof typeof QP_STAGGER;

/**
 * How much of an element must be on screen before a scroll reveal fires, and
 * whether it fires again on the way back.
 *
 * `once: true` is not a performance choice, it is a usability one: content
 * that re-animates every time it re-enters the viewport makes a page feel
 * unstable and punishes the user for scrolling back to re-read something.
 */
export const QP_VIEWPORT = {
  once: true,
  amount: 0.2,
} as const;

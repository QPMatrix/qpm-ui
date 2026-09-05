/**
 * The QPMatrix motion foundation.
 *
 * Durations, easings, springs, named variants, stagger timings, the
 * reduced-motion reducer and the element map — everything the four motion
 * COMPONENTS share. It lives under `lib/` for the same reason `cn` does: it is
 * infrastructure, it renders nothing, and more than one component needs it.
 *
 * The components themselves are ordinary component folders:
 *   src/components/motion            QPMotion
 *   src/components/reveal            QPReveal
 *   src/components/stagger           QPStagger
 *   src/components/page-transition   QPPageTransition
 */
export * from "./motion-core.constants";
export * from "./motion-core.elements";
export type * from "./motion-core.types";
export * from "./motion-core.utils";

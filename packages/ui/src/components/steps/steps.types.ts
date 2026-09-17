import type { ComponentProps, ReactNode } from "react";

/**
 * QPSteps — public type surface.
 */

/**
 * Where a step stands relative to the current one. Drives the token role AND
 * the visible glyph (number vs. check) — never colour alone (WCAG 2.2 SC
 * 1.4.1).
 */
export type QPStepState = "completed" | "current" | "upcoming";

export interface QPStepItem {
  /** Stable identity. What `onStepClick` reports and what React keys the list by. */
  id: string;
  /** The step's visible name. The only source of rendered copy for this step. */
  label: ReactNode;
  /** Optional supporting text under the label. */
  description?: ReactNode;
  /** Where this step stands. Exactly one item in `items` should be `"current"`. */
  state: QPStepState;
  /**
   * This single step is not selectable even if `onStepClick` is set and the
   * step is completed — e.g. a completed step the flow does not allow
   * revisiting.
   */
  disabled?: boolean;
}

export type QPStepsOrientation = "horizontal" | "vertical";

export interface QPStepsProps extends Omit<ComponentProps<"nav">, "children"> {
  /**
   * Accessible name for the `<nav>` landmark this renders as. Required —
   * an unnamed landmark is worse than no landmark (WCAG 2.2 SC 1.3.1 /
   * `docs/standards/component-definition-of-done.md` §6).
   */
  label: string;
  /** The steps, in visual and document order. */
  items: QPStepItem[];
  /** Row or column layout. Defaults to `"horizontal"`. */
  orientation?: QPStepsOrientation;
  /**
   * Called with a completed step's `id` when the caller wants completed steps
   * to be revisitable. Steps render as real `<button>`s (never links) only
   * when this is passed — this component is not a wizard and owns no
   * navigation state of its own, so without a handler every step is static.
   */
  onStepClick?: (id: string) => void;
  /**
   * The glyph for a completed step, replacing its number. Passed as an
   * element, never a string key (`docs/standards/component-definition-of-done.md`
   * §2). Defaults to a check mark.
   */
  completedIcon?: ReactNode;
  /**
   * Screen-reader-only text appended to a completed step's accessible name,
   * so its state is exposed to assistive technology even though the check
   * glyph is `aria-hidden`. Overridable for localisation.
   */
  completedStateLabel?: string;
  /**
   * Screen-reader-only text appended to the current step's accessible name,
   * in addition to the `aria-current="step"` this component always sets on
   * it — not every screen reader announces `aria-current` the same way, so
   * the redundant text is the safer default. Overridable for localisation.
   */
  currentStateLabel?: string;
  /** Extra classes for each `<li>`, merged through `cn()` last. */
  itemClassName?: string;
}

import type { HTMLMotionProps, Transition } from "motion/react";
import type { CSSProperties, ElementType, ReactNode } from "react";

import type {
  QPDurationName,
  QPEaseName,
  QPStaggerName,
  QPVariantName,
} from "./motion-core.constants";

/**
 * The QPMatrix motion system — public type surface.
 */

/** Every element `QPMotion` and friends are allowed to render as. */
export type QPMotionElement = Extract<
  ElementType,
  | "div"
  | "span"
  | "section"
  | "article"
  | "li"
  | "ul"
  | "ol"
  | "header"
  | "footer"
  | "nav"
  | "main"
  | "p"
>;

/**
 * Props shared by everything in the motion system.
 *
 * `as` is deliberately restricted rather than open: an animated wrapper that
 * can become any element is an easy way to end up with a `<div>` where the
 * document needed a `<section>`, and Motion cannot warn you about it.
 */
export interface QPMotionBaseProps {
  /**
   * Which named motion to play. See `QP_VARIANTS` — `rise` for content
   * entering, `reveal` for a section arriving on scroll, `fade` when position
   * must not shift, `pop` for something the user just created.
   */
  variant?: QPVariantName;
  /** Element to render. Pick the one the DOCUMENT needs, not the one that looks right. */
  as?: QPMotionElement;
  /** Delay before this element starts, in seconds. Prefer stagger over per-item delays. */
  delay?: number;
  /** Override the motion's duration with a token name. */
  duration?: QPDurationName;
  /** Override the motion's easing with a token name. */
  ease?: QPEaseName;
  /** Escape hatch for a genuinely one-off transition. Merged over the resolved one. */
  transition?: Transition;
  children?: ReactNode;
  className?: string | undefined;
  /**
   * Narrowed from Motion's `MotionStyle` to a plain `CSSProperties`.
   *
   * `MotionStyle` additionally accepts MotionValues, which would let a caller
   * drive an animation from outside the motion system and bypass the
   * reduced-motion handling these wrappers exist to apply. Narrowing also
   * means an ordinary `ComponentProps<"div">` rest object spreads in without
   * an assertion, which is the common case by far.
   */
  style?: CSSProperties | undefined;
}

/**
 * Props Motion REDEFINES with its own gesture signatures.
 *
 * `onDrag`/`onPan`/`onAnimationStart` and friends take `(event, info)` under
 * Motion and a plain DOM event under React, so the two are genuinely
 * incompatible rather than merely awkward. They are excluded from the public
 * surface: a caller who needs Motion's gesture API is animating outside the
 * reduced-motion handling these wrappers exist to apply, and should be reaching
 * for a purpose-built component instead.
 */
type QPMotionConflictingProps =
  | "style"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onDragEnter"
  | "onDragExit"
  | "onDragLeave"
  | "onDragOver"
  | "onDrop"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration";

export interface QPMotionProps
  extends
    QPMotionBaseProps,
    Omit<
      HTMLMotionProps<"div">,
      | "variants"
      | "initial"
      | "animate"
      | "exit"
      | "transition"
      | "children"
      | QPMotionConflictingProps
    > {}

export interface QPRevealProps extends QPMotionProps {
  /**
   * Fraction of the element that must be visible before it plays, 0–1.
   * Defaults to 0.2 — enough that the user has clearly arrived at it.
   */
  amount?: number;
  /**
   * Replay every time it re-enters the viewport. Off by default: content that
   * re-animates on scroll-back makes a page feel unstable and punishes the
   * user for re-reading.
   */
  repeat?: boolean;
}

export interface QPStaggerProps extends QPMotionProps {
  /** Gap between children. `tight` for dense lists, `loose` for big sections. */
  stagger?: QPStaggerName;
  /**
   * Play children in reverse order. Useful for a list that grows upward, such
   * as a chat log, where the newest item is nearest the composer.
   */
  reverse?: boolean;
  /**
   * Wait for the viewport before starting, like `QPReveal`.
   *
   * Named `whenVisible` rather than the more obvious `onScroll` because
   * `onScroll` is already a DOM event handler on every element this can render
   * as, and shadowing it with a boolean would make the real handler
   * unreachable.
   */
  whenVisible?: boolean;
}

export interface QPPageTransitionProps extends QPMotionProps {
  /**
   * Identity of the current page. A CHANGE to this is what triggers the
   * transition — pass the route key. Without it the exit animation never runs,
   * because React reuses the same element across navigations.
   */
  pageKey: string;
}

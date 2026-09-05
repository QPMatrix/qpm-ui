import { cva } from "class-variance-authority";

/**
 * QPTypingIndicator — class maps and fixed values.
 */

/** Announced to screen-reader users. Overridable via the `label` prop. */
export const QP_TYPING_INDICATOR_DEFAULT_LABEL = "Assistant is typing";

/** Rendered when the caller passes no `dotCount`. */
export const QP_TYPING_INDICATOR_DEFAULT_DOT_COUNT = 3;

export const qpTypingIndicatorVariants = cva(
  "inline-flex w-fit items-center bg-surface-secondary",
  {
    variants: {
      size: {
        default: "gap-2 rounded-lg px-3 py-2",
        sm: "gap-1.5 rounded-md px-2 py-1",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

/**
 * The bounce is gated behind `motion-safe:` so a user with
 * `prefers-reduced-motion: reduce` gets static dots and the `role="status"`
 * announcement instead of an animation. Duration comes from a @qpmatrix/tokens
 * motion token through an arbitrary property, because Tailwind has no
 * `animation-duration` utility bound to the token scale.
 */
export const qpTypingIndicatorDotVariants = cva(
  "rounded-full bg-fg-muted motion-safe:animate-bounce [animation-duration:var(--duration-slow)]",
  {
    variants: {
      size: {
        default: "size-1.5",
        sm: "size-1",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

/**
 * Staggered start offsets, cycled across however many dots are rendered. Both
 * values are motion tokens; the first dot deliberately has no delay.
 */
export const QP_TYPING_INDICATOR_DOT_DELAY_CLASSES = [
  "",
  "[animation-delay:var(--duration-instant)]",
  "[animation-delay:var(--duration-fast)]",
] as const;

import { cva } from "class-variance-authority";

import type { QPPagePadding, QPPageWidth } from "./page-container.types";

/**
 * QPPageContainer — class maps and fixed values.
 */

/**
 * Reading widths.
 *
 * `prose` is expressed in `ch` rather than `rem` because the constraint is
 * CHARACTERS PER LINE (typographic research puts comfortable reading at
 * roughly 45–75), and `ch` tracks the font actually in use — so an Arabic or
 * monospace page gets a width appropriate to its own glyphs instead of a
 * pixel figure derived from Latin text.
 */
export const QP_PAGE_WIDTH_CLASSES = {
  prose: "max-w-[68ch]",
  content: "max-w-5xl",
  wide: "max-w-7xl",
  full: "max-w-none",
} as const satisfies Record<QPPageWidth, string>;

export const QP_PAGE_PADDING_CLASSES = {
  none: "py-0",
  compact: "py-6",
  default: "py-10",
  spacious: "py-16",
} as const satisfies Record<QPPagePadding, string>;

/**
 * Inline padding is NOT part of the `padding` variant.
 *
 * It scales with the viewport rather than with the caller's vertical rhythm
 * choice — a spacious page still needs 16px of gutter on a phone — so it
 * belongs in the base classes where it cannot be switched off by accident.
 */
export const qpPageContainerVariants = cva("mx-auto w-full px-4 sm:px-6 lg:px-8", {
  variants: {
    width: QP_PAGE_WIDTH_CLASSES,
    padding: QP_PAGE_PADDING_CLASSES,
  },
  defaultVariants: {
    width: "content",
    padding: "default",
  },
});

import { cva } from "class-variance-authority";

import type { QPSectionAlign, QPSectionSpacing, QPSectionSurface } from "./section.types";

/**
 * QPSection — class maps and fixed values.
 */

export const QP_SECTION_SPACING_CLASSES = {
  none: "",
  compact: "py-6",
  default: "py-10",
  spacious: "py-16 md:py-24",
} as const satisfies Record<QPSectionSpacing, string>;

/**
 * Section surfaces.
 *
 * `brand` is a subtle tint, not the full brand colour: a full-strength brand
 * background behind body text puts the page's contrast at the mercy of one
 * token, and `brand-primary` is already the pair that fails 4.5:1 in dark mode
 * (see `KNOWN_CONTRAST_WAIVERS`). The tint keeps `fg-primary` legible on top.
 */
export const QP_SECTION_SURFACE_CLASSES = {
  none: "",
  subtle: "bg-surface-secondary",
  raised: "bg-surface-primary shadow-elevation-raised",
  brand: "bg-brand-subtle",
} as const satisfies Record<QPSectionSurface, string>;

export const QP_SECTION_ALIGN_CLASSES = {
  start: "text-start items-start",
  // `mx-auto max-w-2xl` on the header block, not on the section: centring the
  // section itself would also centre its content, which is almost never what a
  // centred heading means.
  center: "text-center items-center mx-auto max-w-2xl",
} as const satisfies Record<QPSectionAlign, string>;

export const qpSectionVariants = cva("flex w-full flex-col", {
  variants: {
    spacing: QP_SECTION_SPACING_CLASSES,
    surface: QP_SECTION_SURFACE_CLASSES,
  },
  defaultVariants: {
    spacing: "default",
    surface: "none",
  },
});

/** Gap between the section's header block and its content. */
export const QP_SECTION_HEADER_GAP = "gap-6";

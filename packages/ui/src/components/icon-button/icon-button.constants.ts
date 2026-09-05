import { cva } from "class-variance-authority";

import type { QPIconButtonSize, QPIconButtonPrimitiveProps } from "./icon-button.types";

/**
 * QPIconButton — class maps and fixed values.
 *
 * The primitive's `icon*` sizes set the square footprint but leave the svg at
 * the base `size-4` for all of them. These variants scale the glyph with the
 * box, which is the one visual decision QPIconButton adds on top of `ui/button`.
 */
export const qpIconButtonVariants = cva("", {
  variants: {
    size: {
      sm: "[&_svg:not([class*='size-'])]:size-3.5",
      md: "[&_svg:not([class*='size-'])]:size-4",
      lg: "[&_svg:not([class*='size-'])]:size-5",
    } satisfies Record<QPIconButtonSize, string>,
  },
  defaultVariants: {
    size: "md",
  },
});

/**
 * QPIconButton's public size vocabulary mapped onto the primitive's icon sizes.
 *
 * Exported because a consumer composing `Button` directly needs the same
 * square footprints, and re-deriving them at the call site is how two
 * definitions drift apart.
 */
export const QP_ICON_BUTTON_SIZES = {
  sm: "icon-sm",
  md: "icon",
  lg: "icon-lg",
} as const satisfies Record<QPIconButtonSize, NonNullable<QPIconButtonPrimitiveProps["size"]>>;

/** Applied when the caller passes no `size`. */
export const QP_ICON_BUTTON_DEFAULT_SIZE: QPIconButtonSize = "md";

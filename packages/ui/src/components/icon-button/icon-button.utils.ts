import { QP_ICON_BUTTON_DEFAULT_SIZE, QP_ICON_BUTTON_SIZES } from "./icon-button.constants";
import type { QPIconButtonPrimitiveProps, QPIconButtonSize } from "./icon-button.types";

/**
 * QPIconButton — pure helpers.
 */

/**
 * Resolve the caller's optional `size` to a concrete key.
 *
 * `cva`'s `defaultVariants` covers the class map, but the primitive's `size`
 * prop is a separate lookup that would silently receive `undefined` and fall
 * back to the primitive's own default (a wide `default` pill, not a square).
 * Both lookups therefore have to agree on the same resolved key, which is why
 * this exists rather than two inline `?? "md"` expressions that can drift.
 */
export function qpResolveIconButtonSize(
  size: QPIconButtonSize | null | undefined,
): QPIconButtonSize {
  return size ?? QP_ICON_BUTTON_DEFAULT_SIZE;
}

/** The primitive `size` value for a resolved QPIconButton size. */
export function qpIconButtonPrimitiveSize(
  size: QPIconButtonSize,
): NonNullable<QPIconButtonPrimitiveProps["size"]> {
  return QP_ICON_BUTTON_SIZES[size];
}

import {
  QP_SEGMENTED_CONTROL_DEFAULT_SIZE,
  QP_SEGMENTED_CONTROL_SIZES,
} from "./segmented-control.constants";
import type {
  QPSegmentedControlPrimitiveProps,
  QPSegmentedControlSize,
} from "./segmented-control.types";

/**
 * QPSegmentedControl — pure helpers.
 */

/** Resolve the caller's optional `size` to a concrete key. */
export function qpResolveSegmentedControlSize(
  size: QPSegmentedControlSize | null | undefined,
): QPSegmentedControlSize {
  return size ?? QP_SEGMENTED_CONTROL_DEFAULT_SIZE;
}

/** The primitive `size` value for a resolved QPSegmentedControl size. */
export function qpSegmentedControlPrimitiveSize(
  size: QPSegmentedControlSize,
): NonNullable<QPSegmentedControlPrimitiveProps["size"]> {
  return QP_SEGMENTED_CONTROL_SIZES[size];
}

/**
 * Bridge the primitive's array-valued selection to this control's single
 * value.
 *
 * Base UI's ToggleGroup models value as an array and reports an EMPTY array
 * when the pressed segment is pressed again. A segmented control is radio-like,
 * so that is a no-op rather than a deselect — returning `null` here is what
 * keeps a selection always present instead of leaving the UI with none.
 */
export function qpNextSegmentedValue(groupValue: readonly string[]): string | null {
  return groupValue[0] ?? null;
}

/** The array shape the primitive's `value` prop expects. */
export function qpToSegmentedGroupValue(selected: string | undefined): string[] {
  return selected === undefined ? [] : [selected];
}

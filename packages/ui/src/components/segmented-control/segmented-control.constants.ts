import { cva } from "class-variance-authority";

import type {
  QPSegmentedControlPrimitiveProps,
  QPSegmentedControlSize,
} from "./segmented-control.types";

/**
 * QPSegmentedControl — class maps and fixed values.
 */

/** Public sizes mapped onto the primitive's toggle sizes. */
export const QP_SEGMENTED_CONTROL_SIZES = {
  sm: "sm",
  md: "default",
  lg: "lg",
} as const satisfies Record<
  QPSegmentedControlSize,
  NonNullable<QPSegmentedControlPrimitiveProps["size"]>
>;

/** Applied when the caller passes no `size`. */
export const QP_SEGMENTED_CONTROL_DEFAULT_SIZE: QPSegmentedControlSize = "md";

/**
 * `spacing: 0` on the primitive is what turns its gapped row into joined
 * segments — it drives the `group-data-[spacing=0]` rules inside
 * `ui/toggle-group`, so it is a behavioural constant, not a style tweak.
 */
export const QP_SEGMENTED_CONTROL_SPACING = 0;

/** Container chrome. Exported so consumers can compose the same track. */
export const qpSegmentedControlVariants = cva("", {
  variants: {
    variant: {
      default: "bg-surface-secondary ring-1 ring-border-subtle",
      outline: "bg-transparent ring-1 ring-border-default",
    },
    size: {
      sm: "p-0.5",
      md: "p-0.5",
      lg: "p-1",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

/** Per-segment chrome, including the selected (pressed) treatment. */
export const qpSegmentedControlItemVariants = cva(
  "flex-1 aria-pressed:bg-surface-selected aria-pressed:text-fg-primary",
);

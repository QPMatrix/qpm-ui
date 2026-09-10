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

/**
 * Per-segment chrome, including the selected (pressed) treatment and track
 * width.
 *
 * `segmentWidth: "auto"` adds no width class at all: the primitive already
 * gives every item `shrink-0` (see `ui/toggle-group`), so an unstyled segment
 * already sizes to its own label. `"equal"` is the ONLY variant that forces a
 * share (`flex-1`) — restoring this component's original behaviour, which
 * overlapped unequal labels because every segment claimed the same width
 * regardless of content (QPMSEC-787).
 */
export const qpSegmentedControlItemVariants = cva(
  "aria-pressed:bg-surface-selected aria-pressed:text-fg-primary",
  {
    variants: {
      segmentWidth: {
        auto: "",
        equal: "flex-1",
      },
    },
    defaultVariants: {
      segmentWidth: "auto",
    },
  },
);

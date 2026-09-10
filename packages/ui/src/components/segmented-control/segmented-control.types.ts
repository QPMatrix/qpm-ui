import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";

import type { ToggleGroup } from "../ui/toggle-group";
import type { qpSegmentedControlVariants } from "./segmented-control.constants";

/**
 * QPSegmentedControl — public type surface.
 */

/** The props `ui/toggle-group` accepts, re-exported so wrappers share one source. */
export type QPSegmentedControlPrimitiveProps = ComponentProps<typeof ToggleGroup>;

/** Public size vocabulary, mapped onto the primitive's toggle sizes. */
export type QPSegmentedControlSize = "sm" | "md" | "lg";

/**
 * How each segment claims track width.
 *
 * `"auto"` (the default) sizes every segment to its own label — the
 * primitive already gives each item `shrink-0`, so this is plain content
 * sizing, never an equal share. `"equal"` forces every segment to the same
 * width (`flex-1`), which is this component's original, now-opt-in
 * behaviour: safe only when every label is roughly the same length, since a
 * track of equal shares does not clip or wrap an overlong label — it simply
 * lets that segment's text print over its neighbours.
 */
export type QPSegmentedControlSegmentWidth = "auto" | "equal";

export interface QPSegmentedControlItem {
  /** Stable identity of the segment; what `onValueChange` reports. */
  value: string;
  /** Visible segment content, supplied (and localised) by the consumer. */
  label: ReactNode;
  /** Whether this single segment is inoperable. */
  disabled?: boolean | undefined;
}

export interface QPSegmentedControlProps
  extends
    Omit<
      QPSegmentedControlPrimitiveProps,
      | "value"
      | "defaultValue"
      | "onValueChange"
      | "size"
      | "variant"
      | "spacing"
      | "children"
      | "className"
    >,
    VariantProps<typeof qpSegmentedControlVariants> {
  /** The segments, in visual order. The only source of rendered copy. */
  items: QPSegmentedControlItem[];
  /** Selected segment (controlled). */
  value?: string | undefined;
  /** Initially selected segment (uncontrolled). */
  defaultValue?: string | undefined;
  /** Fired with the newly selected segment. Never fired with an empty selection. */
  onValueChange?: ((value: string) => void) | undefined;
  /** Extra classes for every segment, merged through `cn()` after the variants. */
  itemClassName?: string | undefined;
  /**
   * How each segment claims track width. Defaults to `"auto"` — content
   * sizing, so unequal labels never overlap. Pass `"equal"` to restore the
   * pre-existing equal-share track, and only when every label is a similar
   * length.
   */
  segmentWidth?: QPSegmentedControlSegmentWidth | undefined;
  /**
   * Narrowed from Base UI's `string | ((state) => string)` to a plain string:
   * `cn()` merges class *values*, not class-producing callbacks.
   */
  className?: string | undefined;
}

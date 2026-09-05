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
   * Narrowed from Base UI's `string | ((state) => string)` to a plain string:
   * `cn()` merges class *values*, not class-producing callbacks.
   */
  className?: string | undefined;
}

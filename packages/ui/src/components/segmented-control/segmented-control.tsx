"use client";

import { useCallback, useState } from "react";

import { cn } from "../../lib/utils";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import {
  QP_SEGMENTED_CONTROL_SPACING,
  qpSegmentedControlItemVariants,
  qpSegmentedControlVariants,
} from "./segmented-control.constants";
import type { QPSegmentedControlProps } from "./segmented-control.types";
import {
  qpNextSegmentedValue,
  qpResolveSegmentedControlSize,
  qpSegmentedControlPrimitiveSize,
  qpToSegmentedGroupValue,
} from "./segmented-control.utils";

/**
 * QPSegmentedControl — single-select control rendered as a joined row of segments.
 *
 * Built on `../ui/toggle-group` (Base UI). Everything that is hard to get right
 * comes from the primitive and is deliberately NOT re-implemented here:
 *   - `role="group"` on the root and `aria-pressed` on every segment;
 *   - roving tabindex + Arrow-key traversal via Base UI's composite;
 *   - focus-visible ring and disabled handling from `toggleVariants`.
 *
 * Data in, markup out: the segments come exclusively from `items`, so this file
 * contains no option list and no user-visible string of its own. Give the root
 * an accessible name at the call site with `aria-label` / `aria-labelledby` —
 * a `role="group"` with no name tells assistive tech nothing.
 *
 * The one behaviour added on top of the primitive is *single-select,
 * never-empty* semantics; see `qpNextSegmentedValue` in `.utils.ts`.
 */
export function QPSegmentedControl({
  items,
  value,
  defaultValue,
  onValueChange,
  size,
  variant,
  className,
  itemClassName,
  ...props
}: QPSegmentedControlProps) {
  const sizeKey = qpResolveSegmentedControlSize(size);
  const [uncontrolledValue, setUncontrolledValue] = useState<string | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const selected = isControlled ? value : uncontrolledValue;

  const handleValueChange = useCallback(
    (groupValue: string[]) => {
      const next = qpNextSegmentedValue(groupValue);
      if (next === null) {
        return;
      }
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  return (
    <ToggleGroup
      data-slot="segmented-control"
      size={qpSegmentedControlPrimitiveSize(sizeKey)}
      variant={variant === "outline" ? "outline" : "default"}
      spacing={QP_SEGMENTED_CONTROL_SPACING}
      value={qpToSegmentedGroupValue(selected)}
      onValueChange={handleValueChange}
      className={cn(qpSegmentedControlVariants({ variant, size: sizeKey }), className)}
      {...props}
    >
      {items.map((item) => (
        <ToggleGroupItem
          key={item.value}
          data-slot="segmented-control-item"
          value={item.value}
          disabled={item.disabled ?? false}
          className={cn(qpSegmentedControlItemVariants(), itemClassName)}
        >
          {item.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

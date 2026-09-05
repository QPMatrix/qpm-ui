import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";

import type { Button } from "../ui/button";
import type { qpIconButtonVariants } from "./icon-button.constants";

/**
 * QPIconButton — public type surface.
 *
 * Every prop's TSDoc comment is read twice: once here, and once by
 * `react-docgen-typescript` when it builds the Storybook autodocs table. The
 * comment IS the API documentation.
 */

/** Public size vocabulary. Maps onto the primitive's icon footprints. */
export type QPIconButtonSize = "sm" | "md" | "lg";

/** The props `ui/button` accepts, re-exported so wrappers derive from one source. */
export type QPIconButtonPrimitiveProps = ComponentProps<typeof Button>;

export interface QPIconButtonProps
  extends
    Omit<QPIconButtonPrimitiveProps, "size" | "children" | "className">,
    VariantProps<typeof qpIconButtonVariants> {
  /**
   * The accessible name, rendered as `aria-label`. Required, and supplied by
   * the consumer so it is localised at the call site — describe the *action*
   * ("Close dialog"), not the glyph ("X icon").
   *
   * An icon-only control carries no text node, so without this it is a WCAG
   * 2.2 SC 4.1.2 (Name, Role, Value) failure: screen readers announce
   * "button" and nothing else.
   */
  label: string;
  /**
   * The icon element, passed as a component instance (`<CheckIcon />`), never
   * a string key. Do not put sizing classes on it — `qpIconButtonVariants` owns
   * the glyph scale.
   */
  children: ReactNode;
  /**
   * Narrowed from Base UI's `string | ((state) => string)` to a plain string:
   * `cn()` merges class *values*, not class-producing callbacks.
   */
  className?: string | undefined;
}

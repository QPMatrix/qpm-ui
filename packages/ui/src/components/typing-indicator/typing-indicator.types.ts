import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import type { qpTypingIndicatorVariants } from "./typing-indicator.constants";

/**
 * QPTypingIndicator — public type surface.
 */
export interface QPTypingIndicatorProps
  extends Omit<ComponentProps<"div">, "children">, VariantProps<typeof qpTypingIndicatorVariants> {
  /**
   * Announced by assistive technology and used as the visually hidden label.
   * Defaults to the English `"Assistant is typing"` — override it for
   * localised apps; this string is user-visible to screen-reader users.
   */
  label?: string;
  /** How many decorative dots to render. Defaults to 3. */
  dotCount?: number;
  /** Extra classes for each dot, merged through `cn()` last. */
  dotClassName?: string;
}

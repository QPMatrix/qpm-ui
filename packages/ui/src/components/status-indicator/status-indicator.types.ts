import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";

import type { qpStatusIndicatorVariants } from "./status-indicator.constants";

/**
 * QPStatusIndicator — public type surface.
 */

/**
 * The status vocabulary, split across the two @qpmatrix/tokens families that
 * model it: `status-*` for outcome states and `signal-*` for connection and
 * activity states.
 */
export type QPStatusIndicatorStatus =
  "success" | "warning" | "error" | "info" | "offline" | "live" | "connected" | "processing";

export interface QPStatusIndicatorProps
  extends
    Omit<ComponentProps<"span">, "children">,
    Omit<VariantProps<typeof qpStatusIndicatorVariants>, "status"> {
  /** Which state to show. Selects a token role; it supplies no copy. */
  status: QPStatusIndicatorStatus;
  /**
   * The visible status text. Required unless `label` is supplied — the dot's
   * colour must never be the only carrier of meaning (WCAG 2.2 SC 1.4.1).
   */
  children?: ReactNode;
  /**
   * Accessible name, used when the text is hidden or when `children` is richer
   * markup than a screen reader should read as the status. Rendered visually
   * when `labelHidden` is false and `children` is absent.
   */
  label?: string;
  /**
   * Render `label` for assistive technology only. The caller is then
   * responsible for the second, non-colour channel in surrounding content —
   * use this for dense tables where the column header supplies the meaning.
   */
  labelHidden?: boolean;
  /** Animate the dot. Automatically suppressed under reduced-motion. */
  pulse?: boolean;
  /**
   * Announce changes politely through a live region. Off by default: a page
   * full of live regions is noisier than no live region at all.
   */
  live?: boolean;
  /** Extra classes for the dot, merged through `cn()` last. */
  dotClassName?: string;
}

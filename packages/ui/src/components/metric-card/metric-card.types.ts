import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";

import type { Card } from "../ui/card";
import type { qpMetricCardVariants } from "./metric-card.constants";

/**
 * QPMetricCard — public type surface.
 */

/** Which way a metric moved. Selects a token role; supplies no copy. */
export type QPMetricTrendDirection = "up" | "down" | "flat";

export interface QPMetricTrend {
  /** Which way the metric moved. */
  direction: QPMetricTrendDirection;
  /** The formatted delta, already localised by the caller — e.g. `"+12.4%"`. */
  value: ReactNode;
  /**
   * The sentence assistive technology announces in place of the terse value,
   * e.g. `"up 12.4 percent versus last week"`. Required, because `"+12.4%"`
   * next to a green swatch is not self-describing (WCAG 2.2 SC 1.4.1).
   */
  label: string;
}

/** The props `ui/card` accepts, re-exported so wrappers derive from one source. */
export type QPMetricCardPrimitiveProps = ComponentProps<typeof Card>;

export interface QPMetricCardProps
  extends
    Omit<QPMetricCardPrimitiveProps, "children" | "title">,
    VariantProps<typeof qpMetricCardVariants> {
  /** What the number measures. Rendered as the card's title and used to name it. */
  label: ReactNode;
  /** The formatted metric, already localised by the caller. */
  value: ReactNode;
  /** Optional supporting sentence rendered under the value. */
  description?: ReactNode;
  /**
   * Optional leading glyph, passed as an element (`<UsersIcon />`). Rendered
   * `aria-hidden` — it decorates `label`, it does not replace it.
   */
  icon?: ReactNode;
  /** Optional movement indicator. See {@link QPMetricTrend}. */
  trend?: QPMetricTrend;
  /**
   * Optional element rendered in the header's action slot — a menu trigger, a
   * timeframe switch. Pass an `QPIconButton` or a `QPSegmentedControl`, not markup.
   */
  action?: ReactNode;
  /** Swap the value and trend for skeletons while the number is in flight. */
  loading?: boolean;
  /**
   * Announced while `loading`. Defaults to English; override it for localised
   * apps — this string reaches screen-reader users.
   */
  loadingLabel?: string;
  /** Extra classes for the value element, merged through `cn()` last. */
  valueClassName?: string;
}

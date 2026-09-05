import { cva } from "class-variance-authority";

import type { QPMetricTrendDirection } from "./metric-card.types";

/**
 * QPMetricCard — class maps and fixed values.
 */

/** Announced while the number is in flight. Overridable via `loadingLabel`. */
export const QP_METRIC_CARD_DEFAULT_LOADING_LABEL = "Loading";

export const qpMetricCardVariants = cva("", {
  variants: {
    align: {
      start: "text-start",
      center: "text-center",
    },
  },
  defaultVariants: {
    align: "start",
  },
});

export const qpMetricTrendVariants = cva("inline-flex items-center gap-1 text-xs font-medium", {
  variants: {
    direction: {
      up: "text-status-success",
      down: "text-status-error",
      flat: "text-fg-muted",
    } satisfies Record<QPMetricTrendDirection, string>,
  },
  defaultVariants: {
    direction: "flat",
  },
});

/**
 * `tabular-nums` matters here rather than being a nicety: a dashboard of
 * metrics that re-renders on an interval jitters horizontally with
 * proportional figures, which reads as the layout being broken.
 */
export const QP_METRIC_CARD_VALUE_CLASSES =
  "text-2xl leading-tight font-semibold tabular-nums text-fg-primary";

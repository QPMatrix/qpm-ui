import { cva } from "class-variance-authority";

import type { QPStatusIndicatorStatus } from "./status-indicator.types";

/**
 * QPStatusIndicator — class maps and fixed values.
 *
 * `QP_STATUS_INDICATOR_BACKGROUNDS` is declared once and reused by both the dot
 * and the pulse ring: two cva calls with independently-typed copies of the
 * same map is exactly how a new status ends up styled in one place and
 * transparent in the other.
 */
const QP_STATUS_INDICATOR_BACKGROUNDS = {
  success: "bg-status-success",
  warning: "bg-status-warning",
  error: "bg-status-error",
  info: "bg-status-info",
  offline: "bg-status-offline",
  live: "bg-signal-live",
  connected: "bg-signal-connected",
  processing: "bg-signal-processing",
} as const satisfies Record<QPStatusIndicatorStatus, string>;

export const qpStatusIndicatorVariants = cva("inline-flex items-center", {
  variants: {
    size: {
      sm: "gap-1.5 text-xs",
      md: "gap-2 text-sm",
      lg: "gap-2.5 text-base",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export const qpStatusIndicatorDotVariants = cva("shrink-0 rounded-full", {
  variants: {
    status: QP_STATUS_INDICATOR_BACKGROUNDS,
    size: {
      sm: "size-1.5",
      md: "size-2",
      lg: "size-2.5",
    },
  },
  defaultVariants: {
    status: "info",
    size: "md",
  },
});

/**
 * The pulse ring. Gated behind `motion-safe:` so `prefers-reduced-motion:
 * reduce` yields a static dot; the label still communicates the state, so no
 * information is lost when the animation is suppressed.
 */
export const qpStatusIndicatorPulseVariants = cva(
  "absolute inset-0 rounded-full opacity-60 motion-safe:animate-ping [animation-duration:var(--duration-slower)] motion-reduce:hidden",
  {
    variants: {
      status: QP_STATUS_INDICATOR_BACKGROUNDS,
    },
    defaultVariants: {
      status: "info",
    },
  },
);

export { QP_STATUS_INDICATOR_BACKGROUNDS };

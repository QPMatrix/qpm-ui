import { useId } from "react";

import { cn, isRenderable } from "../../lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import {
  QP_METRIC_CARD_DEFAULT_LOADING_LABEL,
  QP_METRIC_CARD_VALUE_CLASSES,
  qpMetricCardVariants,
  qpMetricTrendVariants,
} from "./metric-card.constants";
import type { QPMetricCardProps } from "./metric-card.types";
import { qpHasTrend } from "./metric-card.utils";

/**
 * QPMetricCard — a single labelled number on a dashboard.
 *
 * A composition of `../ui/card`; the surface, ring and spacing all come from
 * the primitive rather than being re-declared here.
 *
 * Everything user-visible is a prop. In particular the trend is NOT rendered
 * from a hardcoded arrow glyph or a colour alone: `trend.direction` picks the
 * token role, `trend.value` is the caller's formatted string, and
 * `trend.label` is the caller's accessible sentence.
 */
export function QPMetricCard({
  label,
  value,
  description,
  icon,
  trend,
  action,
  loading = false,
  loadingLabel = QP_METRIC_CARD_DEFAULT_LOADING_LABEL,
  align,
  size = "default",
  className,
  valueClassName,
  ...props
}: QPMetricCardProps) {
  const generatedId = useId();
  const labelId = `${generatedId}-label`;
  const trendShown = qpHasTrend(trend);

  return (
    <Card
      data-slot="metric-card"
      size={size}
      aria-labelledby={labelId}
      aria-busy={loading}
      className={cn(qpMetricCardVariants({ align }), className)}
      {...props}
    >
      <CardHeader>
        <CardTitle
          id={labelId}
          data-slot="metric-card-label"
          className="flex items-center gap-2 text-sm font-normal text-fg-secondary"
        >
          {isRenderable(icon) ? (
            <span
              aria-hidden="true"
              data-slot="metric-card-icon"
              className="inline-flex shrink-0 [&_svg:not([class*='size-'])]:size-4"
            >
              {icon}
            </span>
          ) : null}
          {label}
        </CardTitle>
        {isRenderable(action) ? <div data-slot="card-action">{action}</div> : null}
      </CardHeader>

      <CardContent className="flex flex-col gap-1">
        {loading ? (
          <>
            <span className="sr-only">{loadingLabel}</span>
            <Skeleton aria-hidden="true" className="h-8 w-24 rounded-md" />
            {trendShown ? <Skeleton aria-hidden="true" className="h-4 w-16 rounded-md" /> : null}
          </>
        ) : (
          <>
            <p
              data-slot="metric-card-value"
              className={cn(QP_METRIC_CARD_VALUE_CLASSES, valueClassName)}
            >
              {value}
            </p>
            {trendShown ? (
              <span
                data-slot="metric-card-trend"
                data-direction={trend.direction}
                className={qpMetricTrendVariants({ direction: trend.direction })}
              >
                {/*
                 * The terse value is decorative: `trend.label` is the sentence
                 * assistive technology reads, so the two never double up.
                 */}
                <span aria-hidden="true">{trend.value}</span>
                <span className="sr-only">{trend.label}</span>
              </span>
            ) : null}
          </>
        )}

        {isRenderable(description) ? (
          <p data-slot="metric-card-description" className="text-xs text-fg-muted">
            {description}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

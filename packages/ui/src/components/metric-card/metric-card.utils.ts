import type { QPMetricTrend } from "./metric-card.types";

/**
 * QPMetricCard — pure helpers.
 */

/**
 * Is this a usable trend?
 *
 * A trend is only renderable when it carries its own accessible sentence: the
 * terse `value` is marked `aria-hidden`, so a trend with an empty `label`
 * would put a coloured, unlabelled delta on screen and nothing at all in the
 * accessibility tree. Rejecting it here is what makes the WCAG 2.2 SC 1.4.1
 * guarantee unconditional rather than a convention.
 */
export function qpHasTrend(trend: QPMetricTrend | undefined): trend is QPMetricTrend {
  return trend !== undefined && trend.label.trim().length > 0;
}

import { cn, isRenderable } from "../../lib/utils";
import {
  qpStatusIndicatorDotVariants,
  qpStatusIndicatorPulseVariants,
  qpStatusIndicatorVariants,
} from "./status-indicator.constants";
import type { QPStatusIndicatorProps } from "./status-indicator.types";
import { qpResolveStatusText, qpStatusLiveAttributes } from "./status-indicator.utils";

/**
 * QPStatusIndicator — a coloured dot plus a textual status label.
 *
 * The dot alone never carries the meaning. WCAG 2.2 SC 1.4.1 (Use of Colour)
 * requires a second channel, so this component makes the label mandatory in
 * practice: pass visible `children`, or pass `label` and set `labelHidden` to
 * keep it for assistive technology only.
 *
 * Every string is a prop. The `status` union selects a token role and nothing
 * else — status wording ("Online", "متصل", "Degraded") is product- and
 * locale-specific, so this package ships none of it.
 */
export function QPStatusIndicator({
  status,
  children,
  label,
  labelHidden = false,
  pulse = false,
  live = false,
  size,
  className,
  dotClassName,
  ...props
}: QPStatusIndicatorProps) {
  const text = qpResolveStatusText(children, label);
  const sizeKey = size ?? "md";

  return (
    <span
      data-slot="status-indicator"
      data-status={status}
      {...qpStatusLiveAttributes(live)}
      className={cn(qpStatusIndicatorVariants({ size: sizeKey }), className)}
      {...props}
    >
      <span
        aria-hidden="true"
        data-slot="status-indicator-dot"
        className={cn(
          "relative inline-flex",
          qpStatusIndicatorDotVariants({ status, size: sizeKey }),
          dotClassName,
        )}
      >
        {pulse ? <span className={qpStatusIndicatorPulseVariants({ status })} /> : null}
      </span>
      {isRenderable(text) ? (
        <span
          data-slot="status-indicator-label"
          className={labelHidden ? "sr-only" : "text-fg-secondary"}
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}

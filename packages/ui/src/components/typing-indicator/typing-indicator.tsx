import { cn } from "../../lib/utils";
import {
  QP_TYPING_INDICATOR_DEFAULT_DOT_COUNT,
  QP_TYPING_INDICATOR_DEFAULT_LABEL,
  qpTypingIndicatorDotVariants,
  qpTypingIndicatorVariants,
} from "./typing-indicator.constants";
import type { QPTypingIndicatorProps } from "./typing-indicator.types";
import { qpDotDelayClass, qpResolveDotCount } from "./typing-indicator.utils";

/**
 * QPTypingIndicator — the animated "assistant is typing" affordance.
 *
 * The dots are decorative (`aria-hidden`); the state itself is carried by a
 * polite live region containing a visually hidden label, so a screen-reader
 * user is told the assistant is composing without ever seeing the animation.
 */
export function QPTypingIndicator({
  className,
  label = QP_TYPING_INDICATOR_DEFAULT_LABEL,
  dotCount = QP_TYPING_INDICATOR_DEFAULT_DOT_COUNT,
  dotClassName,
  size,
  ...props
}: QPTypingIndicatorProps) {
  const dots = qpResolveDotCount(dotCount);

  return (
    <div
      data-slot="typing-indicator"
      role="status"
      aria-live="polite"
      className={cn(qpTypingIndicatorVariants({ size }), className)}
      {...props}
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden="true" className="flex items-center gap-1">
        {Array.from({ length: dots }, (_unused, index) => (
          <span
            key={index}
            data-slot="typing-indicator-dot"
            className={cn(
              qpTypingIndicatorDotVariants({ size }),
              qpDotDelayClass(index),
              dotClassName,
            )}
          />
        ))}
      </span>
    </div>
  );
}

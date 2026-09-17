import { Check } from "lucide-react";

import { cn, isRenderable } from "../../lib/utils";
import { Button } from "../ui/button";
import {
  QP_STEPS_DEFAULT_COMPLETED_LABEL,
  QP_STEPS_DEFAULT_CURRENT_LABEL,
  QP_STEPS_DEFAULT_ORIENTATION,
  qpStepsIndicatorVariants,
  qpStepsItemVariants,
  qpStepsListVariants,
} from "./steps.constants";
import type { QPStepsProps } from "./steps.types";
import {
  qpIsStepClickable,
  qpStepAriaCurrent,
  qpStepNumber,
  qpStepStateAnnouncement,
} from "./steps.utils";

/**
 * QPSteps — an ordered progress indicator: label, optional description, and
 * a `completed | current | upcoming` state per step.
 *
 * This is NOT a wizard. It renders progress and owns no navigation state of
 * its own — pass `onStepClick` if completed steps should be revisitable, and
 * the caller's own state decides what happens next. Composes `../ui/button`
 * for the clickable case rather than hand-rolling one.
 *
 * Exactly one step carries `aria-current="step"` (the one with
 * `state: "current"`), and every step's state is exposed to assistive
 * technology through its glyph (a check, never colour alone) plus a
 * screen-reader-only suffix — see `completedStateLabel` / `currentStateLabel`.
 */
export function QPSteps({
  label,
  items,
  orientation = QP_STEPS_DEFAULT_ORIENTATION,
  onStepClick,
  completedIcon,
  completedStateLabel = QP_STEPS_DEFAULT_COMPLETED_LABEL,
  currentStateLabel = QP_STEPS_DEFAULT_CURRENT_LABEL,
  className,
  itemClassName,
  ...props
}: QPStepsProps) {
  const hasClickHandler = onStepClick !== undefined;

  return (
    <nav data-slot="steps" aria-label={label} className={cn(className)} {...props}>
      <ol data-slot="steps-list" className={qpStepsListVariants({ orientation })}>
        {items.map((item, index) => {
          const clickable = qpIsStepClickable(item, hasClickHandler);
          const announcement = qpStepStateAnnouncement(
            item,
            completedStateLabel,
            currentStateLabel,
          );
          const indicator =
            item.state === "completed" ? (
              <span aria-hidden="true">
                {isRenderable(completedIcon) ? completedIcon : <Check className="size-4" />}
              </span>
            ) : (
              <span aria-hidden="true">{qpStepNumber(index)}</span>
            );

          const content = (
            <>
              <span
                data-slot="steps-indicator"
                className={qpStepsIndicatorVariants({ state: item.state })}
              >
                {indicator}
              </span>
              <span data-slot="steps-text" className="flex min-w-0 flex-col text-start">
                <span data-slot="steps-label" className="text-label font-medium text-fg-primary">
                  {item.label}
                  {announcement === undefined ? null : (
                    <span className="sr-only"> — {announcement}</span>
                  )}
                </span>
                {isRenderable(item.description) ? (
                  <span data-slot="steps-description" className="text-body-sm text-fg-muted">
                    {item.description}
                  </span>
                ) : null}
              </span>
            </>
          );

          return (
            <li
              key={item.id}
              data-slot="steps-item"
              data-state={item.state}
              className={cn(qpStepsItemVariants({ orientation }), itemClassName)}
            >
              {clickable ? (
                <Button
                  type="button"
                  variant="ghost"
                  data-slot="steps-control"
                  aria-current={qpStepAriaCurrent(item)}
                  className="h-auto items-start gap-2 px-1 py-0.5 text-start font-normal"
                  onClick={() => {
                    onStepClick?.(item.id);
                  }}
                >
                  {content}
                </Button>
              ) : (
                <div
                  data-slot="steps-control"
                  aria-current={qpStepAriaCurrent(item)}
                  className="flex items-start gap-2"
                >
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

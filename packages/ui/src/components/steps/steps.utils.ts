import type { QPStepItem } from "./steps.types";

/**
 * QPSteps — pure helpers.
 */

/**
 * A step renders as a real `<button>` only when the caller passed
 * `onStepClick` AND the step is both completed and not individually
 * disabled. Current and upcoming steps never become clickable here: this
 * component is not a wizard and has no notion of "skip ahead" — that is a
 * decision the consuming flow makes, not this one.
 */
export function qpIsStepClickable(item: QPStepItem, hasClickHandler: boolean): boolean {
  return hasClickHandler && item.state === "completed" && item.disabled !== true;
}

/**
 * The screen-reader-only suffix for a step's accessible name, or `undefined`
 * when the step's state needs no extra announcement (an upcoming step is the
 * unmarked default and speaks for itself).
 */
export function qpStepStateAnnouncement(
  item: QPStepItem,
  completedStateLabel: string,
  currentStateLabel: string,
): string | undefined {
  if (item.state === "completed") {
    return completedStateLabel;
  }
  if (item.state === "current") {
    return currentStateLabel;
  }
  return undefined;
}

/** Exactly one step should carry `aria-current="step"` — the current one. */
export function qpStepAriaCurrent(item: QPStepItem): "step" | undefined {
  return item.state === "current" ? "step" : undefined;
}

/** 1-based position, for the fallback numeral shown when a step is not completed. */
export function qpStepNumber(index: number): number {
  return index + 1;
}

import type { KeyboardEvent } from "react";

import { isRenderable } from "../../lib/utils";
import type { QPComposerProps } from "./composer.types";

/**
 * QPComposer — pure helpers.
 *
 * These are the branchy parts of the component and the ones worth testing
 * without a render: the Enter-to-submit predicate in particular has four
 * conditions, one of which (IME composition) is impossible to exercise
 * reliably through `userEvent`.
 */

/**
 * Should this keydown submit the form?
 *
 * Four separate reasons not to, and every one of them is a real bug if
 * dropped:
 *   - `submitOnEnter` off: the surface wants Enter to insert a newline.
 *   - Shift or Alt held: the universal "newline, not send" chord.
 *   - `isComposing`: a CJK user selecting an IME candidate presses Enter to
 *     COMMIT THE CANDIDATE. Submitting there sends a half-typed message and is
 *     the single most common i18n defect in chat inputs.
 */
export function qpShouldSubmitOnKey(
  event: KeyboardEvent<HTMLTextAreaElement>,
  submitOnEnter: boolean,
): boolean {
  if (!submitOnEnter || event.key !== "Enter") {
    return false;
  }
  if (event.shiftKey || event.altKey) {
    return false;
  }
  return !event.nativeEvent.isComposing;
}

/** Is there anything worth submitting, and is the composer able to submit it? */
export function qpCanSubmitComposer(text: string, disabled: boolean, busy: boolean): boolean {
  return text.trim().length > 0 && !disabled && !busy;
}

/**
 * Which element describes the field.
 *
 * `hint` is dropped from the description while an error is present so screen
 * readers announce one authoritative message rather than two competing ones —
 * an error that has to be heard after a paragraph of help text is an error the
 * user will miss.
 */
export function qpResolveDescribedBy(
  error: QPComposerProps["error"],
  hint: QPComposerProps["hint"],
  errorId: string,
  hintId: string,
): string | undefined {
  if (isRenderable(error)) {
    return errorId;
  }
  return isRenderable(hint) ? hintId : undefined;
}

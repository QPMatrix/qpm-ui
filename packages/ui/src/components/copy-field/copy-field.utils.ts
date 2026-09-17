import type { QPCopyFieldStatus } from "./copy-field.types";

/**
 * QPCopyField — pure helpers.
 */

/**
 * The live-region text for the current copy status. Empty for `"idle"` — no
 * message is announced until a copy has actually been attempted, so mounting
 * the component does not itself trigger a screen-reader announcement.
 */
export function qpCopyFieldStatusMessage(
  status: QPCopyFieldStatus,
  copiedLabel: string,
  failedLabel: string,
): string {
  if (status === "copied") {
    return copiedLabel;
  }
  if (status === "failed") {
    return failedLabel;
  }
  return "";
}

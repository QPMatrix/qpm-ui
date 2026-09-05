import type { QPPageContainerProps } from "./page-container.types";

/**
 * QPPageContainer — pure helpers.
 */

/**
 * Should this container carry a reading-width measure at all?
 *
 * `full` means the caller is doing their own layout inside (a dashboard grid,
 * a split view), in which case a `max-width` on the wrapper is at best inert
 * and at worst silently clips a wide table.
 */
export function qpIsMeasured(width: QPPageContainerProps["width"]): boolean {
  return width !== "full";
}

/**
 * Does this container own the page's `main` landmark?
 *
 * Extracted so the rule is stated once and can be asserted in a test: a page
 * may have exactly one `main`, and every other container must be a `div`,
 * `section` or `article`.
 */
export function qpIsMainLandmark(as: QPPageContainerProps["as"]): boolean {
  return as === "main";
}

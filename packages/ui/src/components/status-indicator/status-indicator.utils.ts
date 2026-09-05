import type { ReactNode } from "react";

import { isRenderable } from "../../lib/utils";

/**
 * QPStatusIndicator — pure helpers.
 */

/**
 * The text the indicator renders, preferring visible `children` over `label`.
 *
 * Both may be absent — a caller can legitimately render a bare dot inside a
 * cell whose column header carries the meaning — so this returns `null` rather
 * than inventing a fallback string. The component then skips the label element
 * entirely instead of emitting an empty one into the accessibility tree.
 */
export function qpResolveStatusText(children: ReactNode, label: string | undefined): ReactNode {
  if (isRenderable(children)) {
    return children;
  }
  return isRenderable(label) ? label : null;
}

/**
 * The live-region attributes, or nothing.
 *
 * Returned as a spreadable object rather than set conditionally inline because
 * `role` and `aria-live` must appear together: `role="status"` without
 * `aria-live` is announced inconsistently across screen readers, and
 * `aria-live` without a role loses the implicit `aria-atomic`.
 */
export function qpStatusLiveAttributes(
  live: boolean,
): { role: "status"; "aria-live": "polite" } | Record<string, never> {
  return live ? { role: "status", "aria-live": "polite" } : {};
}

import type { ReactNode } from "react";

import { isRenderable } from "../../lib/utils";
import type { QPSectionProps } from "./section.types";

/**
 * QPSection — pure helpers.
 */

/** Does the section render a header block at all? */
export function qpHasSectionHeader(props: {
  heading?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  eyebrow?: ReactNode;
}): boolean {
  return (
    isRenderable(props.heading) ||
    isRenderable(props.description) ||
    isRenderable(props.action) ||
    isRenderable(props.eyebrow)
  );
}

/**
 * How the section gets its accessible name.
 *
 * A `<section>` with NO accessible name is not exposed as a landmark by
 * screen readers at all — it becomes an anonymous group, which is strictly
 * worse than a `<div>` because it implies navigable structure that isn't
 * there. So there are exactly three outcomes:
 *
 *   "labelledby" — a visible heading names it (preferred: the name a
 *                  sighted user reads is the name AT announces).
 *   "label"      — no visible heading, but the caller passed `label`.
 *   "none"       — neither. The component then renders a plain `<div>`
 *                  rather than an unnamed `<section>`.
 */
export function qpSectionNaming(
  heading: ReactNode,
  label: string | undefined,
): "labelledby" | "label" | "none" {
  if (isRenderable(heading)) {
    return "labelledby";
  }
  return isRenderable(label) ? "label" : "none";
}

/**
 * The heading level to render.
 *
 * Defaults to 2, which is right far more often than not: a section normally
 * sits under the page's single `<h1>`. It is still worth passing explicitly —
 * a nested section needs 3, and nothing here can know that.
 */
export function qpSectionLevel(level: QPSectionProps["level"]): 1 | 2 | 3 | 4 | 5 | 6 {
  return level ?? 2;
}

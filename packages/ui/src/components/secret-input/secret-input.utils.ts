import type { ReactNode } from "react";

import { isRenderable } from "../../lib/utils";

/**
 * QPSecretInput — pure helpers.
 */

/** `"text"` while visible, `"password"` (the secure default) otherwise. */
export function qpSecretInputType(visible: boolean): "text" | "password" {
  return visible ? "text" : "password";
}

/**
 * The toggle button's accessible name: the action verb plus the field's own
 * label, so two secret inputs on the same page ("API key", "Webhook secret")
 * announce distinct toggle controls rather than two indistinguishable "Show"
 * buttons.
 */
export function qpSecretInputToggleLabel(
  visible: boolean,
  showLabel: string,
  hideLabel: string,
  fieldLabel: string,
): string {
  return `${visible ? hideLabel : showLabel} ${fieldLabel}`;
}

/**
 * Which element describes the field. `hint` drops out while an error is
 * present so assistive technology announces one authoritative message rather
 * than two competing ones.
 */
export function qpResolveSecretInputDescribedBy(
  error: ReactNode,
  hint: ReactNode,
  errorId: string,
  hintId: string,
): string | undefined {
  if (isRenderable(error)) {
    return errorId;
  }
  return isRenderable(hint) ? hintId : undefined;
}

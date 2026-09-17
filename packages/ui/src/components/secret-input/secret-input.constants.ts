/**
 * QPSecretInput — fixed values.
 */

/** Applied when the caller passes no `showLabel`. */
export const QP_SECRET_INPUT_DEFAULT_SHOW_LABEL = "Show";

/** Applied when the caller passes no `hideLabel`. */
export const QP_SECRET_INPUT_DEFAULT_HIDE_LABEL = "Hide";

/**
 * Fixed, non-overridable security defaults. Applied AFTER the caller's
 * `...props` spread in `secret-input.tsx` on purpose — a consumer's native
 * `autoComplete`/`spellCheck` prop, if passed, is not allowed to weaken a
 * secret field's browser-level protections.
 */
export const QP_SECRET_INPUT_AUTOCOMPLETE_OFF = "off";

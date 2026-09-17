import type {
  QPDisplayPreferencesColorScheme,
  QPDisplayPreferencesStorageAdapter,
  QPDisplayPreferencesTextSize,
} from "./display-preferences.types";

/**
 * QPDisplayPreferences — fixed values.
 */

/** The root `style.fontSize` percentage for each text-size step. */
export const QP_DISPLAY_PREFERENCES_FONT_SCALE = {
  sm: "87.5%",
  md: "100%",
  lg: "112.5%",
} as const satisfies Record<QPDisplayPreferencesTextSize, string>;

/** Applied when the caller passes no `defaultTextSize`. */
export const QP_DISPLAY_PREFERENCES_DEFAULT_TEXT_SIZE: QPDisplayPreferencesTextSize = "md";

/** Applied when the caller passes no `defaultReducedMotion`. */
export const QP_DISPLAY_PREFERENCES_DEFAULT_REDUCED_MOTION = false;

/** Applied when the caller passes no `defaultColorScheme`. */
export const QP_DISPLAY_PREFERENCES_DEFAULT_COLOR_SCHEME: QPDisplayPreferencesColorScheme =
  "system";

/** Applied when the caller passes no `storageKey`. */
export const QP_DISPLAY_PREFERENCES_DEFAULT_STORAGE_KEY = "qpmatrix:display-preferences";

/** The set every persisted/selected text size must be a member of. */
export const QP_DISPLAY_PREFERENCES_TEXT_SIZES = ["sm", "md", "lg"] as const;

/** The set every persisted/selected colour scheme must be a member of. */
export const QP_DISPLAY_PREFERENCES_COLOR_SCHEMES = ["system", "light", "dark"] as const;

/**
 * An adapter that persists nothing. The documented "works with no storage"
 * fallback — pass this as `storageAdapter` to opt every control out of
 * persistence while keeping it fully functional.
 */
export const QP_DISPLAY_PREFERENCES_NOOP_ADAPTER: QPDisplayPreferencesStorageAdapter = {
  read: () => null,
  write: () => undefined,
};

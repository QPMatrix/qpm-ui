import type { QpThemeMode } from "../../lib/theme";
import {
  QP_DISPLAY_PREFERENCES_COLOR_SCHEMES,
  QP_DISPLAY_PREFERENCES_FONT_SCALE,
  QP_DISPLAY_PREFERENCES_TEXT_SIZES,
} from "./display-preferences.constants";
import type {
  QPDisplayPreferencesColorScheme,
  QPDisplayPreferencesPersistedState,
  QPDisplayPreferencesTextSize,
} from "./display-preferences.types";

/**
 * QPDisplayPreferences — pure helpers.
 *
 * Everything here operates on plain values (strings, booleans, the parsed
 * JSON shape) — no storage, no `document`, no hooks. The impure half (reading
 * `localStorage`, writing to the document root, subscribing to
 * `prefers-color-scheme`) lives in `display-preferences.tsx`.
 */

export function qpIsTextSize(value: unknown): value is QPDisplayPreferencesTextSize {
  return QP_DISPLAY_PREFERENCES_TEXT_SIZES.some((entry) => entry === value);
}

export function qpIsColorScheme(value: unknown): value is QPDisplayPreferencesColorScheme {
  return QP_DISPLAY_PREFERENCES_COLOR_SCHEMES.some((entry) => entry === value);
}

/** The root `style.fontSize` percentage for a text-size step. */
export function qpResolveFontScale(textSize: QPDisplayPreferencesTextSize): string {
  return QP_DISPLAY_PREFERENCES_FONT_SCALE[textSize];
}

/**
 * `"system"` resolves against the OS-level preference; `"light"`/`"dark"` are
 * already a `QpThemeMode` and pass straight through to `../../lib/theme`'s
 * two-mode contract.
 */
export function qpResolveEffectiveThemeMode(
  colorScheme: QPDisplayPreferencesColorScheme,
  systemPrefersLight: boolean,
): QpThemeMode {
  if (colorScheme === "system") {
    return systemPrefersLight ? "light" : "dark";
  }
  return colorScheme;
}

/**
 * Parse a persisted JSON blob into whatever subset of the three preferences
 * it validly contains. Never throws: a missing key, malformed JSON, or a
 * value outside the known enum for a field silently drops just that field,
 * so one corrupted entry does not take down the other two.
 */
export function qpParsePersistedPreferences(
  raw: string | null,
): Partial<QPDisplayPreferencesPersistedState> {
  if (raw === null) {
    return {};
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (typeof parsed !== "object" || parsed === null) {
    return {};
  }
  const candidate = parsed as Record<string, unknown>;
  const result: Partial<QPDisplayPreferencesPersistedState> = {};
  if (qpIsTextSize(candidate.textSize)) {
    result.textSize = candidate.textSize;
  }
  if (typeof candidate.reducedMotion === "boolean") {
    result.reducedMotion = candidate.reducedMotion;
  }
  if (qpIsColorScheme(candidate.colorScheme)) {
    result.colorScheme = candidate.colorScheme;
  }
  return result;
}

/** Serialise the full preference state for persistence. */
export function qpSerializePreferences(state: QPDisplayPreferencesPersistedState): string {
  return JSON.stringify(state);
}

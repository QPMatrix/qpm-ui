import type { QPSegmentedControlItem } from "../segmented-control";

/**
 * QPDisplayPreferences — public type surface.
 */

/** Root font-size steps. Values only — the visible labels come from `textSizeItems`. */
export type QPDisplayPreferencesTextSize = "sm" | "md" | "lg";

/**
 * Colour scheme choices. `"system"` is resolved against the OS-level
 * `prefers-color-scheme` query before being applied through
 * `../../lib/theme`'s two-mode contract (`"light" | "dark"` only) — this
 * component adds the "follow the system" layer on top, it does not change
 * what the theme contract itself accepts.
 */
export type QPDisplayPreferencesColorScheme = "system" | "light" | "dark";

/** The persisted shape, one JSON blob under a single storage key. */
export interface QPDisplayPreferencesPersistedState {
  textSize: QPDisplayPreferencesTextSize;
  reducedMotion: boolean;
  colorScheme: QPDisplayPreferencesColorScheme;
}

/**
 * The storage operation this component needs, narrowed to two guarded
 * methods so a test (or a browser with storage disabled) can inject a
 * substitute. Both are expected to swallow their own errors — see
 * `qpCreateGuardedLocalStorageAdapter` in `display-preferences.tsx` for the
 * default, `localStorage`-backed implementation.
 */
export interface QPDisplayPreferencesStorageAdapter {
  read: (key: string) => string | null;
  write: (key: string, value: string) => void;
}

export interface QPDisplayPreferencesProps {
  /**
   * Accessible name for the panel, rendered as a real `<legend>` inside a
   * `<fieldset>` — the panel is a labelled group (WCAG 2.2 SC 1.3.1), not an
   * anonymous one.
   */
  legend: string;
  /** Visible label for the text-size row. */
  textSizeLabel: string;
  /** The text-size segments, in visual order — `value` must be a `QPDisplayPreferencesTextSize`. */
  textSizeItems: QPSegmentedControlItem[];
  /** Visible label for the reduced-motion switch. */
  reducedMotionLabel: string;
  /** Visible label for the colour-scheme row. */
  colorSchemeLabel: string;
  /** The colour-scheme segments, in visual order — `value` must be a `QPDisplayPreferencesColorScheme`. */
  colorSchemeItems: QPSegmentedControlItem[];
  /** Initial text size when nothing is persisted yet. Defaults to `"md"`. */
  defaultTextSize?: QPDisplayPreferencesTextSize;
  /** Called with the new text size whenever it changes, persisted or not. */
  onTextSizeChange?: (textSize: QPDisplayPreferencesTextSize) => void;
  /** Initial reduced-motion state when nothing is persisted yet. Defaults to `false`. */
  defaultReducedMotion?: boolean;
  /** Called with the new reduced-motion state whenever it changes. */
  onReducedMotionChange?: (reducedMotion: boolean) => void;
  /** Initial colour scheme when nothing is persisted yet. Defaults to `"system"`. */
  defaultColorScheme?: QPDisplayPreferencesColorScheme;
  /** Called with the new colour scheme whenever it changes. */
  onColorSchemeChange?: (colorScheme: QPDisplayPreferencesColorScheme) => void;
  /**
   * Where preferences persist. Defaults to a guarded `localStorage` adapter;
   * pass `QP_DISPLAY_PREFERENCES_NOOP_ADAPTER` (or any adapter) to opt out —
   * every control still works, it just does not remember its state.
   */
  storageAdapter?: QPDisplayPreferencesStorageAdapter;
  /** The storage key the adapter reads and writes. Defaults to a package-namespaced key. */
  storageKey?: string;
  /**
   * The element preferences apply to. Defaults to `document.documentElement`
   * — override only for testing, or to scope preferences to a subtree
   * instead of the whole document.
   */
  root?: () => HTMLElement | null;
  /** Extra classes on the panel, merged through `cn()` last. */
  className?: string;
}

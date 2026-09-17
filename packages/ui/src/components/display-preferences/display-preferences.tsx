"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";

import {
  QP_REDUCED_MOTION_ATTRIBUTE,
  QP_REDUCED_MOTION_ATTRIBUTE_VALUE,
} from "../../lib/motion/motion-core.constants";
import { resolveThemeSelection, themeAttributes } from "../../lib/theme";
import { cn } from "../../lib/utils";
import { QPSegmentedControl } from "../segmented-control";
import { FieldLegend, FieldSet } from "../ui/field";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
  QP_DISPLAY_PREFERENCES_DEFAULT_COLOR_SCHEME,
  QP_DISPLAY_PREFERENCES_DEFAULT_REDUCED_MOTION,
  QP_DISPLAY_PREFERENCES_DEFAULT_STORAGE_KEY,
  QP_DISPLAY_PREFERENCES_DEFAULT_TEXT_SIZE,
} from "./display-preferences.constants";
import type {
  QPDisplayPreferencesColorScheme,
  QPDisplayPreferencesProps,
  QPDisplayPreferencesStorageAdapter,
  QPDisplayPreferencesTextSize,
} from "./display-preferences.types";
import {
  qpIsColorScheme,
  qpIsTextSize,
  qpParsePersistedPreferences,
  qpResolveEffectiveThemeMode,
  qpResolveFontScale,
  qpSerializePreferences,
} from "./display-preferences.utils";

/**
 * `localStorage`, guarded. Storage can throw (quota exceeded, disabled,
 * private-browsing mode in some browsers, no `window` at all during SSR) —
 * every method here swallows its own error and falls back to "nothing
 * persisted", which is exactly what `QP_DISPLAY_PREFERENCES_NOOP_ADAPTER`
 * gives you deliberately. The closures read `window.localStorage` fresh on
 * every call rather than capturing it, so one module-level instance is safe
 * to share.
 */
function qpCreateGuardedLocalStorageAdapter(): QPDisplayPreferencesStorageAdapter {
  return {
    read: (key) => {
      try {
        if (typeof window === "undefined") {
          return null;
        }
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    write: (key, value) => {
      try {
        if (typeof window === "undefined") {
          return;
        }
        window.localStorage.setItem(key, value);
      } catch {
        // Renders correctly when storage throws — the panel just does not
        // remember this change.
      }
    },
  };
}

const QP_DEFAULT_STORAGE_ADAPTER = qpCreateGuardedLocalStorageAdapter();

/**
 * Call `adapter.read` defensively.
 *
 * The shipped default adapter above already guards `localStorage` itself,
 * but `storageAdapter` is a public prop — a caller's own adapter is not
 * guaranteed to guard itself, and "renders correctly when storage throws" is
 * this component's contract, not something it can delegate to every adapter
 * author. Belt and suspenders: guarded at both layers.
 */
function qpReadPreferencesGuarded(
  adapter: QPDisplayPreferencesStorageAdapter,
  key: string,
): string | null {
  try {
    return adapter.read(key);
  } catch {
    return null;
  }
}

/** See `qpReadPreferencesGuarded` — the same defence on the write path. */
function qpWritePreferencesGuarded(
  adapter: QPDisplayPreferencesStorageAdapter,
  key: string,
  value: string,
): void {
  try {
    adapter.write(key, value);
  } catch {
    // Renders (and keeps working) correctly when storage throws.
  }
}

function qpDefaultRoot(): HTMLElement | null {
  return typeof document === "undefined" ? null : document.documentElement;
}

function subscribeToSystemColorScheme(onStoreChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const query = window.matchMedia("(prefers-color-scheme: light)");
  query.addEventListener("change", onStoreChange);
  return () => {
    query.removeEventListener("change", onStoreChange);
  };
}

function getSystemPrefersLightSnapshot(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches;
}

function getSystemPrefersLightServerSnapshot(): boolean {
  return false;
}

/** Live view of the OS-level `prefers-color-scheme` query, for `colorScheme="system"`. */
function useSystemPrefersLight(): boolean {
  return useSyncExternalStore(
    subscribeToSystemColorScheme,
    getSystemPrefersLightSnapshot,
    getSystemPrefersLightServerSnapshot,
  );
}

/**
 * QPDisplayPreferences — text size, reduced motion and colour scheme
 * controls, persisted per viewer.
 *
 * A `<fieldset>` (native `role="group"`) named by a real `<legend>` — the
 * panel is a labelled group, not an anonymous one — containing three rows,
 * each with its own visible label:
 *
 *   - text size: `../segmented-control`, applied as a root `style.fontSize`
 *     percentage (`QP_DISPLAY_PREFERENCES_FONT_SCALE`);
 *   - reduced motion: `../ui/switch`, applied as
 *     `data-qp-reduced-motion="reduce"` on the root — the attribute
 *     `useQpRootReducedMotion` (`../../lib/motion`) reads, so every QPMatrix
 *     motion component honours it immediately, live;
 *   - colour scheme: `../segmented-control` with a `"system"` option this
 *     component resolves against the OS `prefers-color-scheme` query before
 *     handing a concrete `"light" | "dark"` to `../../lib/theme`'s
 *     `themeAttributes` — the theme contract itself is never widened, this
 *     is a layer on top of it, applied through it, never with ad-hoc classes.
 *
 * All three persist as one JSON blob via `storageAdapter` (a guarded
 * `localStorage` adapter by default) and all three still work — they just do
 * not remember — when storage throws or is replaced with
 * `QP_DISPLAY_PREFERENCES_NOOP_ADAPTER`.
 */
export function QPDisplayPreferences({
  legend,
  textSizeLabel,
  textSizeItems,
  reducedMotionLabel,
  colorSchemeLabel,
  colorSchemeItems,
  defaultTextSize = QP_DISPLAY_PREFERENCES_DEFAULT_TEXT_SIZE,
  onTextSizeChange,
  defaultReducedMotion = QP_DISPLAY_PREFERENCES_DEFAULT_REDUCED_MOTION,
  onReducedMotionChange,
  defaultColorScheme = QP_DISPLAY_PREFERENCES_DEFAULT_COLOR_SCHEME,
  onColorSchemeChange,
  storageAdapter,
  storageKey = QP_DISPLAY_PREFERENCES_DEFAULT_STORAGE_KEY,
  root,
  className,
}: QPDisplayPreferencesProps) {
  const generatedId = useId();
  const textSizeLabelId = `${generatedId}-text-size-label`;
  const reducedMotionId = `${generatedId}-reduced-motion`;
  const colorSchemeLabelId = `${generatedId}-color-scheme-label`;

  const activeAdapter = storageAdapter ?? QP_DEFAULT_STORAGE_ADAPTER;
  const resolveRoot = root ?? qpDefaultRoot;
  const persisted = qpParsePersistedPreferences(
    qpReadPreferencesGuarded(activeAdapter, storageKey),
  );

  const [textSize, setTextSize] = useState<QPDisplayPreferencesTextSize>(
    () => persisted.textSize ?? defaultTextSize,
  );
  const [reducedMotion, setReducedMotion] = useState<boolean>(
    () => persisted.reducedMotion ?? defaultReducedMotion,
  );
  const [colorScheme, setColorScheme] = useState<QPDisplayPreferencesColorScheme>(
    () => persisted.colorScheme ?? defaultColorScheme,
  );

  const systemPrefersLight = useSystemPrefersLight();
  const effectiveMode = qpResolveEffectiveThemeMode(colorScheme, systemPrefersLight);

  useEffect(() => {
    const target = resolveRoot();
    if (target === null) {
      return;
    }
    target.style.fontSize = qpResolveFontScale(textSize);
  }, [textSize, resolveRoot]);

  useEffect(() => {
    const target = resolveRoot();
    if (target === null) {
      return;
    }
    if (reducedMotion) {
      target.setAttribute(QP_REDUCED_MOTION_ATTRIBUTE, QP_REDUCED_MOTION_ATTRIBUTE_VALUE);
    } else {
      target.removeAttribute(QP_REDUCED_MOTION_ATTRIBUTE);
    }
  }, [reducedMotion, resolveRoot]);

  useEffect(() => {
    const target = resolveRoot();
    if (target === null) {
      return;
    }
    const attributes = themeAttributes(
      resolveThemeSelection({ mode: effectiveMode, accent: "brand" }),
    );
    target.setAttribute("data-qp-accent", attributes["data-qp-accent"]);
    if (attributes["data-theme"] === undefined) {
      target.removeAttribute("data-theme");
    } else {
      target.setAttribute("data-theme", attributes["data-theme"]);
    }
  }, [effectiveMode, resolveRoot]);

  useEffect(() => {
    qpWritePreferencesGuarded(
      activeAdapter,
      storageKey,
      qpSerializePreferences({ textSize, reducedMotion, colorScheme }),
    );
    // `activeAdapter` intentionally excluded: it is either the module-level
    // default (stable) or a caller-supplied adapter, and re-running this
    // effect only on the actual preference values (not on every render a
    // caller re-creates their adapter object) is the useful behaviour here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textSize, reducedMotion, colorScheme, storageKey]);

  return (
    <FieldSet data-slot="display-preferences" className={cn("gap-4", className)}>
      <FieldLegend data-slot="display-preferences-legend" variant="legend">
        {legend}
      </FieldLegend>

      <div data-slot="display-preferences-row" className="flex items-center justify-between gap-4">
        <Label id={textSizeLabelId}>{textSizeLabel}</Label>
        <QPSegmentedControl
          aria-labelledby={textSizeLabelId}
          items={textSizeItems}
          value={textSize}
          onValueChange={(value) => {
            if (!qpIsTextSize(value)) {
              return;
            }
            setTextSize(value);
            onTextSizeChange?.(value);
          }}
        />
      </div>

      <div data-slot="display-preferences-row" className="flex items-center justify-between gap-4">
        {/*
         * `htmlFor`/`id` does not name a Base UI Switch: with
         * `nativeButton={false}` (the default `../ui/switch` uses), the
         * VISIBLE `[role=switch]` element gets an internally-generated id,
         * and the id a caller passes lands on Base UI's own hidden input
         * instead. `aria-labelledby`, which the primitive reads directly off
         * its own props, is the association that actually reaches the
         * visible element — the same mechanism the two segmented-control
         * rows above already use.
         */}
        <Label id={reducedMotionId}>{reducedMotionLabel}</Label>
        <Switch
          aria-labelledby={reducedMotionId}
          checked={reducedMotion}
          onCheckedChange={(checked) => {
            setReducedMotion(checked);
            onReducedMotionChange?.(checked);
          }}
        />
      </div>

      <div data-slot="display-preferences-row" className="flex items-center justify-between gap-4">
        <Label id={colorSchemeLabelId}>{colorSchemeLabel}</Label>
        <QPSegmentedControl
          aria-labelledby={colorSchemeLabelId}
          items={colorSchemeItems}
          value={colorScheme}
          onValueChange={(value) => {
            if (!qpIsColorScheme(value)) {
              return;
            }
            setColorScheme(value);
            onColorSchemeChange?.(value);
          }}
        />
      </div>
    </FieldSet>
  );
}

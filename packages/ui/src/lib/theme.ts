import type { TokenVarName } from "@qpmatrix/tokens";

/**
 * Server-driven theme contract for QPMatrix apps.
 *
 * The server decides which theme selections a user is *allowed* to pick; the
 * client only applies a selection that is on the approved list below. This
 * module is deliberately dependency-free (no react, no zod) so it can run in a
 * server component, an edge handler, a React Native bridge, or a plain script.
 * The Zod schema that validates a selection arriving over the wire lives in
 * `src/registry/schemas/theme-contract.schema.ts` (tooling/test-side only), so
 * `@qpmatrix/ui`'s published runtime never gains a validation dependency.
 *
 * IMPORTANT — this file does not *invent* theme values. Every approved mode and
 * accent below must resolve to tokens that already exist in @qpmatrix/tokens
 * (see `.agents/skills/tokens/SKILL.md`'s transcription rule). Adding an accent
 * here without adding its tokens first is a validation failure, not a feature.
 */

/**
 * Modes @qpmatrix/tokens actually ships. `dark` is the `:root` default;
 * `light` is the `[data-theme="light"]` override block in tokens.css.
 */
export const QP_THEME_MODES = ["dark", "light"] as const;

export type QpThemeMode = (typeof QP_THEME_MODES)[number];

/**
 * Accents a user may select. Exactly one today: the token set the design source
 * defines. This is a contract surface, not a palette generator — a second
 * accent becomes selectable only once @qpmatrix/tokens transcribes its four
 * roles from the design source.
 */
export const QP_THEME_ACCENTS = ["brand"] as const;

export type QpThemeAccent = (typeof QP_THEME_ACCENTS)[number];

/** The four semantic roles every accent must supply. */
export interface QpAccentRoles {
  /** Fill of the accent's primary control surface. */
  readonly base: TokenVarName;
  /** Pressed/active variant of `base`. */
  readonly strong: TokenVarName;
  /** Text/icon color that sits on `base` and `strong`. */
  readonly foreground: TokenVarName;
  /** Low-emphasis accent surface (chips, hover washes). */
  readonly subtle: TokenVarName;
}

/**
 * Accent -> token mapping. `check-theme-contrast.ts` walks this map and asserts
 * every `foreground` on `base`/`strong` pair meets WCAG 2.2 AA in every
 * approved mode, so a mis-mapped accent fails CI rather than shipping.
 */
export const QP_ACCENT_TOKEN_ROLES: Readonly<Record<QpThemeAccent, QpAccentRoles>> = {
  brand: {
    base: "brand-primary",
    strong: "brand-strong",
    foreground: "brand-foreground",
    subtle: "brand-subtle",
  },
};

export interface QpThemeSelection {
  readonly mode: QpThemeMode;
  readonly accent: QpThemeAccent;
}

export const QP_DEFAULT_THEME_SELECTION: QpThemeSelection = {
  mode: "dark",
  accent: "brand",
};

function isThemeMode(value: unknown): value is QpThemeMode {
  return QP_THEME_MODES.some((mode) => mode === value);
}

function isThemeAccent(value: unknown): value is QpThemeAccent {
  return QP_THEME_ACCENTS.some((accent) => accent === value);
}

/**
 * Narrow an untrusted value (a cookie, a `/me` response, a query param) to an
 * approved selection. Returns `false` for anything not on the approved list —
 * callers fall back to `QP_DEFAULT_THEME_SELECTION` rather than applying a
 * theme QPMatrix never approved.
 */
export function isApprovedThemeSelection(value: unknown): value is QpThemeSelection {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as { mode?: unknown; accent?: unknown };
  return isThemeMode(candidate.mode) && isThemeAccent(candidate.accent);
}

/**
 * Coerce any untrusted value into an approved selection, falling back to the
 * default. Use this at the app's theme boundary (root layout / theme cookie
 * read) so an unknown value can never reach the DOM.
 */
export function resolveThemeSelection(value: unknown): QpThemeSelection {
  return isApprovedThemeSelection(value) ? value : QP_DEFAULT_THEME_SELECTION;
}

/**
 * DOM attributes that apply a selection. Spread onto `<html>` (or any
 * ancestor):
 *
 * ```tsx
 * <html lang={locale} {...themeAttributes(resolveThemeSelection(serverTheme))}>
 * ```
 *
 * `data-theme` is omitted for `dark` on purpose — dark is tokens.css's `:root`
 * default, and emitting `data-theme="dark"` would imply a second block exists.
 */
export function themeAttributes(selection: QpThemeSelection): {
  "data-qp-accent": QpThemeAccent;
  "data-theme"?: "light";
} {
  return selection.mode === "light"
    ? { "data-qp-accent": selection.accent, "data-theme": "light" }
    : { "data-qp-accent": selection.accent };
}

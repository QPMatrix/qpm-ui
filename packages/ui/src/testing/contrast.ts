import {
  colorsAndGradients,
  type ColorsAndGradientsVarName,
  type TokenVarName,
} from "@qpmatrix/tokens";

import { QP_ACCENT_TOKEN_ROLES, QP_THEME_ACCENTS, type QpThemeMode } from "../lib/theme";

/**
 * Token-level WCAG 2.2 contrast evaluation for @qpmatrix/ui.
 *
 * WHY THIS EXISTS SEPARATELY FROM axe-core: axe's `color-contrast` rule needs a
 * real layout + computed-style engine to resolve `var(--token)` chains. Under
 * happy-dom it returns `incomplete`, never `pass`/`violation` (reproduced
 * directly — see `src/testing/axe.ts`). So colour is checked here, at the token
 * layer, against @qpmatrix/tokens' own `resolved` values, for every approved
 * theme mode. axe covers structure; this covers colour. Neither alone is a
 * compliance claim (docs/standards/accessibility.md, "Automated vs manual").
 *
 * Everything here is pure arithmetic over @qpmatrix/tokens — no DOM, no React.
 */

export interface Rgba {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
}

const HEX_SHORT = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i;
const HEX_LONG = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i;
const RGB_FUNCTIONAL =
  /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i;

/**
 * Parse the CSS colour forms @qpmatrix/tokens actually emits: `#RGB`,
 * `#RRGGBB`, `#RRGGBBAA`, `rgb(r,g,b)` and `rgba(r,g,b,a)`. Returns `null` for
 * anything else (notably `linear-gradient(...)` — gradients are excluded from
 * contrast pairs on purpose; a gradient has no single background colour, so its
 * contrast must be asserted against the specific stops a component uses).
 */
export function parseCssColor(value: string): Rgba | null {
  const input = value.trim();

  const short = HEX_SHORT.exec(input);
  if (short?.[1] !== undefined && short[2] !== undefined && short[3] !== undefined) {
    return {
      r: Number.parseInt(short[1].repeat(2), 16),
      g: Number.parseInt(short[2].repeat(2), 16),
      b: Number.parseInt(short[3].repeat(2), 16),
      a: 1,
    };
  }

  const long = HEX_LONG.exec(input);
  if (long?.[1] !== undefined && long[2] !== undefined && long[3] !== undefined) {
    const alpha = long[4];
    return {
      r: Number.parseInt(long[1], 16),
      g: Number.parseInt(long[2], 16),
      b: Number.parseInt(long[3], 16),
      a: alpha === undefined ? 1 : Number.parseInt(alpha, 16) / 255,
    };
  }

  const functional = RGB_FUNCTIONAL.exec(input);
  if (functional?.[1] !== undefined && functional[2] !== undefined && functional[3] !== undefined) {
    const alpha = functional[4];
    return {
      r: Number.parseFloat(functional[1]),
      g: Number.parseFloat(functional[2]),
      b: Number.parseFloat(functional[3]),
      a: alpha === undefined ? 1 : Number.parseFloat(alpha),
    };
  }

  return null;
}

/** Alpha-composite `source` over an opaque `backdrop` (simple "over" operator). */
export function compositeOver(source: Rgba, backdrop: Rgba): Rgba {
  if (source.a >= 1) {
    return source;
  }
  return {
    r: source.r * source.a + backdrop.r * (1 - source.a),
    g: source.g * source.a + backdrop.g * (1 - source.a),
    b: source.b * source.a + backdrop.b * (1 - source.a),
    a: 1,
  };
}

function channelLuminance(channel8Bit: number): number {
  const channel = channel8Bit / 255;
  return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
}

/** WCAG 2.x relative luminance. Input must be opaque; composite first if not. */
export function relativeLuminance(color: Rgba): number {
  return (
    0.2126 * channelLuminance(color.r) +
    0.7152 * channelLuminance(color.g) +
    0.0722 * channelLuminance(color.b)
  );
}

/** WCAG 2.x contrast ratio, 1..21. Both inputs must be opaque. */
export function contrastRatio(a: Rgba, b: Rgba): number {
  const luminanceA = relativeLuminance(a);
  const luminanceB = relativeLuminance(b);
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * The literal colour a token resolves to in a given approved mode. `light`
 * falls back to the `:root` (dark) value when the token has no
 * `[data-theme="light"]` override, exactly as the cascade would.
 */
export function resolveTokenColor(name: ColorsAndGradientsVarName, mode: QpThemeMode): string {
  const entry: { resolved: string; light?: { resolved: string } } = colorsAndGradients[name];
  if (mode === "light" && entry.light !== undefined) {
    return entry.light.resolved;
  }
  return entry.resolved;
}

/**
 * WCAG 2.2 minimum ratios, keyed by what the colour pair is used for.
 *
 * - `body-text` — 1.4.3 Contrast (Minimum), text below the large-text threshold.
 * - `large-text` — 1.4.3, text >= 24px, or >= 18.66px bold.
 * - `ui-component` — 1.4.11 Non-text Contrast: control boundaries, focus
 *   indicators, icons that carry meaning.
 */
export const CONTRAST_USAGE_MINIMUMS = {
  "body-text": 4.5,
  "large-text": 3,
  "ui-component": 3,
} as const;

export type ContrastUsage = keyof typeof CONTRAST_USAGE_MINIMUMS;

export interface ContrastPair {
  /** Stable id, used to reference the pair from the waiver list. */
  readonly id: string;
  readonly foreground: ColorsAndGradientsVarName;
  readonly background: ColorsAndGradientsVarName;
  /**
   * Opaque colour a translucent `background` sits on. Required whenever
   * `background` has alpha < 1 — without it the ratio is undefined.
   */
  readonly backdrop?: ColorsAndGradientsVarName;
  /**
   * Alpha applied to `background` before compositing, 0-1.
   *
   * Tailwind's slash modifier (`bg-destructive/10`) makes a translucent
   * background out of an opaque token, and the resulting colour exists ONLY in
   * the component's class string — there is no token for it. Without this
   * field the checker cannot express those pairs at all, which is how a real
   * failure shipped: the `destructive` button renders red text on a red tint
   * at 4.30:1 (light) and 4.46:1 (dark), and nothing here could see it.
   *
   * Requires `backdrop`, since a translucent colour has no ratio on its own.
   */
  readonly backgroundAlpha?: number;
  /**
   * Alpha applied to `foreground` before compositing, 0-1.
   *
   * Tailwind's `opacity-90` on a text node blends the GLYPH into its
   * background — a different case from a translucent background, and the one
   * that put a message timestamp at 3.43:1.
   */
  readonly foregroundAlpha?: number;
  /**
   * Themes this pair actually renders in. Defaults to all of them.
   *
   * Most pairs apply everywhere: the tokens flip under `[data-theme="light"]`
   * and the same component renders in both. But a Tailwind `dark:` variant
   * renders in ONE theme only, and evaluating it in the other measures a
   * combination no user can ever see — which reports a failure that cannot be
   * fixed because it does not exist.
   */
  readonly modes?: readonly QpThemeMode[];
  readonly usage: ContrastUsage;
  /** Where in @qpmatrix/ui this pair actually renders. */
  readonly where: string;
}

/**
 * Every semantic foreground/background combination @qpmatrix/ui renders that
 * carries meaning. This list is the definition of "approved theme
 * combinations" in docs/standards/accessibility.md — a component may not
 * introduce a new meaningful colour pair without adding it here.
 *
 * Gradients (`gradient-*`) are excluded: contrast against a gradient is not a
 * single number. Components that place text on a gradient must assert against
 * the gradient's darkest and lightest stops individually.
 */
export const APPROVED_CONTRAST_PAIRS: readonly ContrastPair[] = [
  {
    id: "fg-primary-on-surface-primary",
    foreground: "fg-primary",
    background: "surface-primary",
    usage: "body-text",
    where: "Default body text on a card/panel surface (Card, QPMetricCard, Input).",
  },
  {
    id: "fg-primary-on-surface-secondary",
    foreground: "fg-primary",
    background: "surface-secondary",
    usage: "body-text",
    where: "Dialog panel title and body text.",
  },
  {
    id: "fg-primary-on-bg-canvas",
    foreground: "fg-primary",
    background: "bg-canvas",
    usage: "body-text",
    where: "Page-level text on the app canvas.",
  },
  {
    id: "fg-secondary-on-surface-primary",
    foreground: "fg-secondary",
    background: "surface-primary",
    usage: "body-text",
    where: "Secondary/supporting text (QPMetricCard label, Alert body).",
  },
  {
    id: "fg-secondary-on-surface-secondary",
    foreground: "fg-secondary",
    background: "surface-secondary",
    usage: "body-text",
    where: "Dialog description text.",
  },
  {
    id: "fg-muted-on-surface-primary",
    foreground: "fg-muted",
    background: "surface-primary",
    usage: "body-text",
    where: "Muted metadata text (timestamps, helper text).",
  },
  {
    /*
     * Retained as a GUARD, not because anything renders it.
     *
     * `brand-foreground` on `brand-primary` is 4.04:1 in dark — below 4.5:1.
     * Every filled surface in the kit now uses `brand-strong` instead, so this
     * pair should never come back. `usage: "ui-component"` reflects what the
     * combination is still legitimately used for: non-text marks, where 3:1
     * applies and it passes.
     */
    id: "brand-foreground-on-brand-primary",
    foreground: "brand-foreground",
    background: "brand-primary",
    usage: "ui-component",
    where: "Non-text brand marks only. Body text on brand-primary is banned — use brand-strong.",
  },
  {
    id: "brand-foreground-on-brand-strong",
    foreground: "brand-foreground",
    background: "brand-strong",
    usage: "body-text",
    where: 'Button variant="primary" pressed/active label.',
  },
  {
    /*
     * MEASURED, and the reason the tinted-surface pattern changed.
     *
     * `status-success` on its own `-bg` tint does not clear 4.5:1 in BOTH
     * themes anywhere in this palette (success 6.22 dark / 3.15 light,
     * warning 7.19 / 2.76, error 4.38 / 4.70, info 4.23 / 4.50). Coloured
     * status text on its own tint is therefore not a viable pattern at
     * normal size here, so components render `fg-primary` on the tint
     * instead — 13.9-17.1:1 in both modes — and the tint alone carries the
     * tone. Colour was already a redundant cue: the label is always text.
     */
    id: "fg-primary-on-status-success-bg",
    foreground: "fg-primary",
    background: "status-success-bg",
    backdrop: "surface-primary",
    usage: "body-text",
    where: 'QPProductBadge / Alert tone="success" text on its tint.',
  },
  {
    /*
     * MEASURED, and the reason the tinted-surface pattern changed.
     *
     * `status-error` on its own `-bg` tint does not clear 4.5:1 in BOTH
     * themes anywhere in this palette (success 6.22 dark / 3.15 light,
     * warning 7.19 / 2.76, error 4.38 / 4.70, info 4.23 / 4.50). Coloured
     * status text on its own tint is therefore not a viable pattern at
     * normal size here, so components render `fg-primary` on the tint
     * instead — 13.9-17.1:1 in both modes — and the tint alone carries the
     * tone. Colour was already a redundant cue: the label is always text.
     */
    id: "fg-primary-on-status-error-bg",
    foreground: "fg-primary",
    background: "status-error-bg",
    backdrop: "surface-primary",
    usage: "body-text",
    where: 'QPProductBadge / Alert tone="error" text on its tint.',
  },
  {
    /*
     * MEASURED, and the reason the tinted-surface pattern changed.
     *
     * `status-warning` on its own `-bg` tint does not clear 4.5:1 in BOTH
     * themes anywhere in this palette (success 6.22 dark / 3.15 light,
     * warning 7.19 / 2.76, error 4.38 / 4.70, info 4.23 / 4.50). Coloured
     * status text on its own tint is therefore not a viable pattern at
     * normal size here, so components render `fg-primary` on the tint
     * instead — 13.9-17.1:1 in both modes — and the tint alone carries the
     * tone. Colour was already a redundant cue: the label is always text.
     */
    id: "fg-primary-on-status-warning-bg",
    foreground: "fg-primary",
    background: "status-warning-bg",
    backdrop: "surface-primary",
    usage: "body-text",
    where: 'QPProductBadge / Alert tone="warning" text on its tint.',
  },
  {
    /*
     * MEASURED, and the reason the tinted-surface pattern changed.
     *
     * `status-info` on its own `-bg` tint does not clear 4.5:1 in BOTH
     * themes anywhere in this palette (success 6.22 dark / 3.15 light,
     * warning 7.19 / 2.76, error 4.38 / 4.70, info 4.23 / 4.50). Coloured
     * status text on its own tint is therefore not a viable pattern at
     * normal size here, so components render `fg-primary` on the tint
     * instead — 13.9-17.1:1 in both modes — and the tint alone carries the
     * tone. Colour was already a redundant cue: the label is always text.
     */
    id: "fg-primary-on-status-info-bg",
    foreground: "fg-primary",
    background: "status-info-bg",
    backdrop: "surface-primary",
    usage: "body-text",
    where: 'QPProductBadge / Alert tone="info" text on its tint.',
  },
  {
    /*
     * The `destructive` Button variant: red text on a red tint.
     *
     * Invisible to this checker until `backgroundAlpha` existed, because the
     * tint is a Tailwind slash modifier (`bg-destructive/10`) with no token of
     * its own. Found by opening Storybook in a real browser, where axe
     * reported 4.30:1 in light and 4.46:1 in dark — both below 1.4.3's 4.5:1
     * for normal text. The alphas in `ui/button.tsx` were lowered until both
     * themes clear it; these pairs stop the values drifting back.
     */
    id: "destructive-text-on-destructive-tint",
    foreground: "status-error",
    background: "status-error",
    backdrop: "bg-canvas",
    backgroundAlpha: 0.05,
    modes: ["light"],
    usage: "body-text",
    where: 'Button variant="destructive" label, light theme (bg-destructive/5).',
  },
  {
    id: "destructive-text-on-destructive-tint-dark",
    foreground: "status-error",
    background: "status-error",
    backdrop: "bg-canvas",
    backgroundAlpha: 0.1,
    modes: ["dark"],
    usage: "body-text",
    where: 'Button variant="destructive" label, dark theme (dark:bg-destructive/10).',
  },
  {
    /*
     * The `link` Button variant puts brand-primary text straight on the page
     * canvas. It passes comfortably, but was not covered by any pair — found
     * while tracing the destructive failure, so it is listed rather than left
     * to be rediscovered.
     */
    id: "brand-primary-on-bg-canvas",
    foreground: "brand-primary",
    background: "bg-canvas",
    usage: "body-text",
    where: 'Button variant="link" label.',
  },
  {
    /*
     * QPMessageBubble author="user". Uses `brand-strong`, NOT `brand-primary`:
     * the latter is 4.04:1 against brand-foreground in dark, which is what the
     * brand-primary waiver exists for and explicitly tells components not to do.
     */
    id: "brand-foreground-on-brand-strong-bubble",
    foreground: "brand-foreground",
    background: "brand-strong",
    usage: "body-text",
    where:
      'EVERY filled brand surface: --primary maps here, so this covers Button default, Badge default, checked Checkbox/Radio, Progress fill, selected Calendar days, selection highlight and QPMessageBubble author="user".',
  },
  {
    /*
     * QPProductBadge brand tint. `brand-subtle` is translucent
     * (rgba(139,92,246,0.12)), so the rendered colour only exists composited
     * over the canvas — axe in a real browser measured brand-primary text on
     * it at 4.23:1. Badges now use `fg-primary`, which measures 17.16:1 dark
     * and 15.41:1 light.
     */
    id: "fg-primary-on-brand-subtle",
    foreground: "fg-primary",
    background: "brand-subtle",
    backdrop: "bg-canvas",
    usage: "body-text",
    where: "QPProductBadge brand-tinted chip label.",
  },
  {
    /*
     * QPMessageBubble timestamp inside the user bubble, at `opacity-90`.
     *
     * Opacity on TEXT is a third compositing case, distinct from a translucent
     * background: the glyph itself blends into whatever it sits on. At the
     * original 70% this measured 3.43:1 in dark and was invisible to every
     * automated gate until axe ran in a real browser.
     */
    id: "bubble-timestamp-on-brand-strong",
    foreground: "brand-foreground",
    background: "brand-strong",
    foregroundAlpha: 0.9,
    usage: "body-text",
    where: "QPMessageBubble timestamp inside the user bubble.",
  },
  {
    id: "border-focus-on-surface-primary",
    foreground: "border-focus",
    background: "surface-primary",
    usage: "ui-component",
    where: "Focus ring against a card surface (WCAG 2.2 2.4.11/2.4.13).",
  },
  {
    id: "border-focus-on-bg-canvas",
    foreground: "border-focus",
    background: "bg-canvas",
    usage: "ui-component",
    where: "Focus ring against the page canvas.",
  },
  {
    /*
     * The control boundary, which SC 1.4.11 requires at 3:1 because it is
     * what identifies where the input is.
     *
     * `border-default` measures 1.43:1 (dark) / 1.48:1 (light) against
     * surface-primary and cannot serve here; `border-interactive` measures
     * 3.15:1 / 5.70:1 and does. `styles/qpmatrix.css` therefore maps
     * `--input` to `border-interactive`, NOT to `border-default`.
     *
     * `border-default` itself is not listed as a pair: it is used only for
     * decorative container edges (card borders, separators) where the
     * surface change already delineates the region. SC 1.4.11 applies to
     * non-text content "required to identify" a component, which a
     * redundant card edge is not.
     */
    id: "border-interactive-on-surface-primary",
    foreground: "border-interactive",
    background: "surface-primary",
    usage: "ui-component",
    where: "Input / Select / Checkbox control boundary (--input).",
  },
  {
    id: "status-success-on-surface-primary",
    foreground: "status-success",
    background: "surface-primary",
    usage: "ui-component",
    where: "QPStatusIndicator dot — colour is a redundant cue, never the only one.",
  },
  {
    id: "status-error-on-surface-primary",
    foreground: "status-error",
    background: "surface-primary",
    usage: "ui-component",
    where: "QPStatusIndicator dot / destructive icon glyph.",
  },
];

export interface ContrastWaiver {
  /** `ContrastPair.id` this waiver covers. */
  readonly pairId: string;
  /** Modes the failure occurs in. A waiver is stale if the pair passes here. */
  readonly modes: readonly QpThemeMode[];
  /** Why it is not fixed, and what the fix is. Required — never blank. */
  readonly reason: string;
  /** What consumers must do until the token is fixed. */
  readonly mitigation: string;
}

/**
 * Explicit, reviewed exceptions. A waiver is NOT a way to silence a finding —
 * `check-theme-contrast.ts` still prints every waived pair as a warning, and
 * fails if a waiver has gone stale (i.e. the pair now passes, so the waiver
 * must be deleted). Adding an entry here requires the reason and the mitigation
 * to be filled in; see docs/standards/accessibility.md, "Colour standard".
 */
export const KNOWN_CONTRAST_WAIVERS: readonly ContrastWaiver[] = [
  /*
   * EMPTY, and that is the point.
   *
   * This list held one entry for most of this work: `brand-foreground` on
   * `brand-primary` at 4.04:1, waived because fixing it looked like it needed
   * a change to the owner's design source. Running axe over the built
   * Storybook in a real browser showed the pair rendering on the default
   * Button, the Composer's submit control and every user message bubble — i.e.
   * the waiver's own mitigation ("use large text, or render in light mode")
   * was not being followed anywhere, so the waiver was covering a live defect
   * rather than an accepted one.
   *
   * The fix needed no token change at all: filled surfaces moved to
   * `brand-strong` (5.45:1 dark, 7.94:1 light), which already existed.
   *
   * Keep this empty. A waiver is a promise that somebody looked, decided, and
   * wrote down a mitigation — and the stale-waiver check above will fail the
   * build the moment one stops being true.
   */
];

export interface ContrastResult {
  readonly pair: ContrastPair;
  readonly mode: QpThemeMode;
  readonly ratio: number;
  readonly required: number;
  readonly passes: boolean;
  readonly waived: boolean;
  readonly foregroundColor: string;
  readonly backgroundColor: string;
}

function opaqueColor(
  token: ColorsAndGradientsVarName,
  mode: QpThemeMode,
  backdrop: ColorsAndGradientsVarName | undefined,
): { color: Rgba; raw: string } {
  const raw = resolveTokenColor(token, mode);
  const parsed = parseCssColor(raw);
  if (parsed === null) {
    throw new Error(
      `Token "${token}" resolves to "${raw}" in ${mode} mode, which is not a flat colour. ` +
        "Gradient and keyword tokens cannot be used in a contrast pair.",
    );
  }
  if (parsed.a >= 1) {
    return { color: parsed, raw };
  }
  if (backdrop === undefined) {
    throw new Error(
      `Token "${token}" is translucent (${raw}) in ${mode} mode; the contrast pair must declare a "backdrop" token.`,
    );
  }
  const backdropRaw = resolveTokenColor(backdrop, mode);
  const backdropParsed = parseCssColor(backdropRaw);
  if (backdropParsed === null || backdropParsed.a < 1) {
    throw new Error(
      `Backdrop token "${backdrop}" must resolve to an opaque colour; got "${backdropRaw}" in ${mode} mode.`,
    );
  }
  return { color: compositeOver(parsed, backdropParsed), raw };
}

/**
 * Narrow the accent-role contract's `TokenVarName` (the union of every token
 * @qpmatrix/tokens ships, across every group) down to `ColorsAndGradientsVarName`
 * (the subset `opaqueColor`/`resolveTokenColor` can actually look up). Accent
 * roles are documented as colour tokens (`theme.ts`'s `QpAccentRoles`), but
 * their declared type is the wider `TokenVarName`, so this is a genuine
 * runtime check, not a formality: a future accent role wired to e.g. a
 * spacing or radius token would fail loudly here instead of producing a
 * bogus contrast ratio.
 */
function isColorToken(name: string): name is ColorsAndGradientsVarName {
  return Object.hasOwn(colorsAndGradients, name);
}

function assertColorToken(name: TokenVarName): ColorsAndGradientsVarName {
  if (!isColorToken(name)) {
    throw new Error(
      `Accent role token "${name}" is not a colour token in @qpmatrix/tokens' ` +
        "colors-and-gradients group; accent base/strong/foreground/subtle roles must resolve to colours.",
    );
  }
  return name;
}

function isWaived(pair: ContrastPair, mode: QpThemeMode): boolean {
  return KNOWN_CONTRAST_WAIVERS.some(
    (waiver) => waiver.pairId === pair.id && waiver.modes.includes(mode),
  );
}

/**
 * Composite a token over its backdrop at a given alpha.
 *
 * Models Tailwind's `bg-token/NN` modifier: the token is drawn at NN% over
 * whatever is behind it. Returns the input untouched when no alpha is set, so
 * every existing pair is unaffected.
 */
function applyAlpha(
  colour: { color: Rgba; raw: string },
  alpha: number | undefined,
  backdrop: ColorsAndGradientsVarName | undefined,
  mode: QpThemeMode,
): { color: Rgba; raw: string } {
  if (alpha === undefined) {
    return colour;
  }
  if (backdrop === undefined) {
    throw new Error(
      `A pair with backgroundAlpha must also declare a "backdrop": a translucent colour has no contrast ratio on its own.`,
    );
  }
  const behind = parseCssColor(resolveTokenColor(backdrop, mode));
  if (behind === null || behind.a < 1) {
    throw new Error(`Backdrop "${backdrop}" must resolve to an opaque colour in ${mode} mode.`);
  }
  return {
    color: compositeOver({ ...colour.color, a: alpha }, behind),
    raw: `${colour.raw} @ ${String(Math.round(alpha * 100))}% over ${backdrop}`,
  };
}

/** Evaluate one pair in one mode. */
export function evaluateContrastPair(pair: ContrastPair, mode: QpThemeMode): ContrastResult {
  const background = applyAlpha(
    opaqueColor(pair.background, mode, pair.backdrop),
    pair.backgroundAlpha,
    pair.backdrop,
    mode,
  );
  const foreground = applyAlpha(
    opaqueColor(pair.foreground, mode, pair.background),
    pair.foregroundAlpha,
    pair.background,
    mode,
  );
  const ratio = contrastRatio(foreground.color, background.color);
  const required = CONTRAST_USAGE_MINIMUMS[pair.usage];
  return {
    pair,
    mode,
    ratio,
    required,
    passes: ratio >= required,
    waived: isWaived(pair, mode),
    foregroundColor: foreground.raw,
    backgroundColor: background.raw,
  };
}

/** Evaluate every approved pair across every approved mode. */
export function evaluateAllContrastPairs(modes: readonly QpThemeMode[]): ContrastResult[] {
  return modes.flatMap((mode) =>
    APPROVED_CONTRAST_PAIRS.filter(
      (pair) => pair.modes === undefined || pair.modes.includes(mode),
    ).map((pair) => evaluateContrastPair(pair, mode)),
  );
}

export interface AccentContrastResult {
  readonly accent: string;
  readonly mode: QpThemeMode;
  readonly role: "base" | "strong";
  readonly ratio: number;
  readonly passes: boolean;
}

/**
 * Every approved accent's `foreground` against its `base` and `strong` fills.
 * This is what makes `QP_ACCENT_TOKEN_ROLES` (server-driven theme selection)
 * safe to extend: adding an accent without accessible token values fails here.
 * Evaluated at the 3:1 non-text/large-text bar, consistent with the
 * `brand-foreground-on-brand-primary` waiver above.
 */
export function evaluateAccentContrast(modes: readonly QpThemeMode[]): AccentContrastResult[] {
  return modes.flatMap((mode) =>
    QP_THEME_ACCENTS.flatMap((accent) => {
      const roles = QP_ACCENT_TOKEN_ROLES[accent];
      const foreground = opaqueColor(assertColorToken(roles.foreground), mode, undefined);
      return (["base", "strong"] as const).map((role) => {
        const background = opaqueColor(assertColorToken(roles[role]), mode, undefined);
        const ratio = contrastRatio(foreground.color, background.color);
        return {
          accent,
          mode,
          role,
          ratio,
          passes: ratio >= CONTRAST_USAGE_MINIMUMS["ui-component"],
        };
      });
    }),
  );
}

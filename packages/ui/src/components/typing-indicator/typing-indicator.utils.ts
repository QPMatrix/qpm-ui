import { QP_TYPING_INDICATOR_DOT_DELAY_CLASSES } from "./typing-indicator.constants";

/**
 * QPTypingIndicator — pure helpers.
 */

/**
 * Clamp `dotCount` to a renderable integer.
 *
 * `Array.from({ length })` throws on a negative length and silently produces a
 * gigantic array on a fractional or huge one, so a caller passing a computed
 * value (`messages.length - 1`, say) must not be able to crash the render.
 * Truncating rather than rounding keeps `2.9` at two dots, matching what a
 * caller counting whole items means.
 */
export function qpResolveDotCount(dotCount: number): number {
  if (!Number.isFinite(dotCount)) {
    return 0;
  }
  return Math.max(0, Math.trunc(dotCount));
}

/**
 * The animation-delay class for the dot at `index`, cycling through the
 * stagger offsets so any dot count keeps a wave rather than pulsing in unison.
 */
export function qpDotDelayClass(index: number): string {
  const classes = QP_TYPING_INDICATOR_DOT_DELAY_CLASSES;
  return classes[index % classes.length] ?? "";
}

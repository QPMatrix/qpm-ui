/**
 * Internal accessibility-testing barrel for @qpmtx/ui.
 *
 * Excluded from the published build (`tsconfig.build.json` excludes
 * `src/testing`) — everything here, and everything it depends on
 * (axe-core, @testing-library/*), is a dev/test-time-only concern and must
 * never become a runtime dependency of the package's consumers.
 */

export { expectNoAxeViolations, formatIncomplete, runAxe, type RunAxeOptions } from "./axe";
export {
  expectAccessibleName,
  expectFocusRestored,
  expectFocusTrapped,
  expectKeyboardOperable,
  expectNoPositiveTabIndex,
  getTabbableElements,
} from "./a11y";
export {
  APPROVED_CONTRAST_PAIRS,
  CONTRAST_USAGE_MINIMUMS,
  KNOWN_CONTRAST_WAIVERS,
  compositeOver,
  contrastRatio,
  evaluateAccentContrast,
  evaluateAllContrastPairs,
  evaluateContrastPair,
  parseCssColor,
  relativeLuminance,
  resolveTokenColor,
  type AccentContrastResult,
  type ContrastPair,
  type ContrastResult,
  type ContrastUsage,
  type ContrastWaiver,
  type Rgba,
} from "./contrast";

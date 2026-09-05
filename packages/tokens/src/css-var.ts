import type { ColorsAndGradientsVarName } from "./groups/colors-and-gradients";
import type { ElevationAndGlowShadowsVarName } from "./groups/elevation-and-glow-shadows";
import type { MotionAndZIndexVarName } from "./groups/motion-and-zindex";
import type { RadiusVarName } from "./groups/radius";
import type { SpacingAndLayoutVarName } from "./groups/spacing-and-layout";
import type { TypographyVarName } from "./groups/typography";

/**
 * Union of every CSS custom-property name (without the leading `--`) shipped
 * by @qpmatrix/tokens. Kept in sync with the token group objects — see
 * packages/.agents/skills/tokens/SKILL.md for how to add a token.
 */
export type TokenVarName =
  | ColorsAndGradientsVarName
  | TypographyVarName
  | SpacingAndLayoutVarName
  | RadiusVarName
  | ElevationAndGlowShadowsVarName
  | MotionAndZIndexVarName;

/**
 * Build a `var(--token-name)` reference for a known QPMatrix design token.
 *
 * Consumers use this instead of hardcoding `"var(--brand-primary)"` strings,
 * so a renamed or removed token becomes a type error rather than a silent
 * runtime mismatch.
 *
 * @example
 * ```ts
 * import { cssVar } from "@qpmatrix/tokens";
 *
 * const style = { color: cssVar("fg-primary") }; // -> { color: "var(--fg-primary)" }
 * ```
 */
export function cssVar(name: TokenVarName): string {
  return `var(--${name})`;
}

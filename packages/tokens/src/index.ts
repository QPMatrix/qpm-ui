/**
 * @qpmtx/tokens — framework-agnostic QPMatrix design token system.
 *
 * Ships two aligned deliverables generated from the same design source:
 *   - CSS custom properties: import "@qpmtx/tokens/css" (see tokens.css)
 *   - Typed token objects: the named exports below
 *
 * See README.md for the consumption model and
 * packages/.agents/skills/tokens/SKILL.md for how to extend it.
 */
export { colorsAndGradients, type ColorsAndGradientsVarName } from "./groups/colors-and-gradients";
export {
  elevationAndGlowShadows,
  type ElevationAndGlowShadowsVarName,
} from "./groups/elevation-and-glow-shadows";
export { motionAndZIndex, type MotionAndZIndexVarName } from "./groups/motion-and-zindex";
export { radius, type RadiusVarName } from "./groups/radius";
export { spacingAndLayout, type SpacingAndLayoutVarName } from "./groups/spacing-and-layout";
export { typography, type TypographyVarName } from "./groups/typography";

export { cssVar, type TokenVarName } from "./css-var";

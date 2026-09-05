/**
 * QPMatrix design tokens - group: motion-and-zindex
 *
 * AUTO-TRANSCRIBED from the owner's design source (tokens.json / tokens.css extracted
 * from the QPMatrix Design System export). Do not hand-edit values here - regenerate
 * from the live source per packages/.agents/skills/tokens/SKILL.md instead.
 *
 * Each entry mirrors the source JSON 1:1:
 *   raw    - the literal CSS declaration value (may reference other vars)
 *   resolved - raw fully dereferenced down to a literal (hex/rgba/px/...)
 *   light  - present only for tokens overridden by [data-theme="light"]
 *   usedByComponentBundle - whether the owner's component bundle references this token
 */
export const motionAndZIndex = {
  "breakpoint-desktop": {
    raw: "1440px",
    resolved: "1440px",
    usedByComponentBundle: false,
  },
  "breakpoint-laptop": {
    raw: "1024px",
    resolved: "1024px",
    usedByComponentBundle: false,
  },
  "breakpoint-mobile": {
    raw: "480px",
    resolved: "480px",
    usedByComponentBundle: false,
  },
  "breakpoint-tablet": {
    raw: "768px",
    resolved: "768px",
    usedByComponentBundle: false,
  },
  "breakpoint-wide": {
    raw: "1920px",
    resolved: "1920px",
    usedByComponentBundle: false,
  },
  "duration-ambient": {
    raw: "2400ms",
    resolved: "2400ms",
    usedByComponentBundle: true,
  },
  "duration-fast": {
    raw: "160ms",
    resolved: "160ms",
    usedByComponentBundle: true,
  },
  "duration-flow": {
    raw: "3600ms",
    resolved: "3600ms",
    usedByComponentBundle: true,
  },
  "duration-instant": {
    raw: "80ms",
    resolved: "80ms",
    usedByComponentBundle: true,
  },
  "duration-slow": {
    raw: "450ms",
    resolved: "450ms",
    usedByComponentBundle: true,
  },
  "duration-standard": {
    raw: "280ms",
    resolved: "280ms",
    usedByComponentBundle: true,
  },
  "ease-in": {
    raw: "cubic-bezier(0.4,0,1,1)",
    resolved: "cubic-bezier(0.4,0,1,1)",
    usedByComponentBundle: false,
  },
  "ease-inout": {
    raw: "cubic-bezier(0.65,0,0.35,1)",
    resolved: "cubic-bezier(0.65,0,0.35,1)",
    usedByComponentBundle: true,
  },
  "ease-out": {
    raw: "cubic-bezier(0.16,1,0.3,1)",
    resolved: "cubic-bezier(0.16,1,0.3,1)",
    usedByComponentBundle: true,
  },
  "ease-standard": {
    raw: "cubic-bezier(0.22,1,0.36,1)",
    resolved: "cubic-bezier(0.22,1,0.36,1)",
    usedByComponentBundle: true,
  },
  "spring-damping": {
    raw: "30",
    resolved: "30",
    usedByComponentBundle: false,
  },
  "spring-stiffness": {
    raw: "260",
    resolved: "260",
    usedByComponentBundle: false,
  },
  "z-critical": {
    raw: "700",
    resolved: "700",
    usedByComponentBundle: false,
  },
  "z-dialog": {
    raw: "500",
    resolved: "500",
    usedByComponentBundle: true,
  },
  "z-drawer": {
    raw: "300",
    resolved: "300",
    usedByComponentBundle: false,
  },
  "z-dropdown": {
    raw: "200",
    resolved: "200",
    usedByComponentBundle: true,
  },
  "z-nav": {
    raw: "100",
    resolved: "100",
    usedByComponentBundle: false,
  },
  "z-overlay": {
    raw: "400",
    resolved: "400",
    usedByComponentBundle: false,
  },
  "z-toast": {
    raw: "600",
    resolved: "600",
    usedByComponentBundle: false,
  },
} as const;

export type MotionAndZIndexVarName = keyof typeof motionAndZIndex;

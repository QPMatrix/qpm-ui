/**
 * QPMatrix design tokens - group: radius
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
export const radius = {
  "radius-full": {
    raw: "999px",
    resolved: "999px",
    usedByComponentBundle: true,
  },
  "radius-lg": {
    raw: "12px",
    resolved: "12px",
    usedByComponentBundle: true,
  },
  "radius-md": {
    raw: "8px",
    resolved: "8px",
    usedByComponentBundle: true,
  },
  "radius-none": {
    raw: "0px",
    resolved: "0px",
    usedByComponentBundle: false,
  },
  "radius-sm": {
    raw: "4px",
    resolved: "4px",
    usedByComponentBundle: true,
  },
  "radius-xl": {
    raw: "20px",
    resolved: "20px",
    usedByComponentBundle: false,
  },
} as const;

export type RadiusVarName = keyof typeof radius;

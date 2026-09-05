/**
 * QPMatrix design tokens - group: spacing-and-layout
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
export const spacingAndLayout = {
  "card-padding-comfortable": {
    raw: "var(--space-6)",
    resolved: "24px",
    usedByComponentBundle: true,
  },
  "card-padding-compact": {
    raw: "var(--space-4)",
    resolved: "16px",
    usedByComponentBundle: true,
  },
  "content-width-dashboard": {
    raw: "1440px",
    resolved: "1440px",
    usedByComponentBundle: false,
  },
  "content-width-docs": {
    raw: "840px",
    resolved: "840px",
    usedByComponentBundle: false,
  },
  "content-width-marketing": {
    raw: "1200px",
    resolved: "1200px",
    usedByComponentBundle: false,
  },
  "form-field-spacing": {
    raw: "var(--space-4)",
    resolved: "16px",
    usedByComponentBundle: false,
  },
  "nav-height": {
    raw: "60px",
    resolved: "60px",
    usedByComponentBundle: false,
  },
  "nav-rail-width": {
    raw: "240px",
    resolved: "240px",
    usedByComponentBundle: false,
  },
  "nav-rail-width-collapsed": {
    raw: "64px",
    resolved: "64px",
    usedByComponentBundle: false,
  },
  "page-gutter-comfortable": {
    raw: "var(--space-8)",
    resolved: "32px",
    usedByComponentBundle: false,
  },
  "page-gutter-compact": {
    raw: "var(--space-5)",
    resolved: "20px",
    usedByComponentBundle: false,
  },
  "section-spacing-comfortable": {
    raw: "var(--space-24)",
    resolved: "96px",
    usedByComponentBundle: false,
  },
  "section-spacing-compact": {
    raw: "var(--space-10)",
    resolved: "40px",
    usedByComponentBundle: false,
  },
  "space-0": {
    raw: "0px",
    resolved: "0px",
    usedByComponentBundle: false,
  },
  "space-1": {
    raw: "4px",
    resolved: "4px",
    usedByComponentBundle: false,
  },
  "space-10": {
    raw: "40px",
    resolved: "40px",
    usedByComponentBundle: false,
  },
  "space-12": {
    raw: "48px",
    resolved: "48px",
    usedByComponentBundle: false,
  },
  "space-16": {
    raw: "64px",
    resolved: "64px",
    usedByComponentBundle: false,
  },
  "space-2": {
    raw: "8px",
    resolved: "8px",
    usedByComponentBundle: false,
  },
  "space-20": {
    raw: "80px",
    resolved: "80px",
    usedByComponentBundle: false,
  },
  "space-24": {
    raw: "96px",
    resolved: "96px",
    usedByComponentBundle: false,
  },
  "space-3": {
    raw: "12px",
    resolved: "12px",
    usedByComponentBundle: false,
  },
  "space-4": {
    raw: "16px",
    resolved: "16px",
    usedByComponentBundle: false,
  },
  "space-5": {
    raw: "20px",
    resolved: "20px",
    usedByComponentBundle: false,
  },
  "space-6": {
    raw: "24px",
    resolved: "24px",
    usedByComponentBundle: true,
  },
  "space-8": {
    raw: "32px",
    resolved: "32px",
    usedByComponentBundle: false,
  },
  "table-row-height-comfortable": {
    raw: "52px",
    resolved: "52px",
    usedByComponentBundle: false,
  },
  "table-row-height-compact": {
    raw: "36px",
    resolved: "36px",
    usedByComponentBundle: false,
  },
} as const;

export type SpacingAndLayoutVarName = keyof typeof spacingAndLayout;

/**
 * QPMatrix design tokens - group: elevation-and-glow-shadows
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
export const elevationAndGlowShadows = {
  "elevation-critical": {
    raw: "0 24px 64px rgba(0,0,0,0.66),0 0 0 1px var(--status-error)",
    resolved: "0 24px 64px rgba(0,0,0,0.66),0 0 0 1px #F0475B",
    usedByComponentBundle: false,
  },
  "elevation-dialog": {
    raw: "0 24px 64px rgba(0,0,0,0.62),0 0 0 1px var(--border-subtle)",
    resolved: "0 24px 64px rgba(0,0,0,0.62),0 0 0 1px #2B3442",
    usedByComponentBundle: true,
  },
  "elevation-drawer": {
    raw: "-10px 0 40px rgba(0,0,0,0.55)",
    resolved: "-10px 0 40px rgba(0,0,0,0.55)",
    usedByComponentBundle: false,
  },
  "elevation-flat": {
    raw: "none",
    resolved: "none",
    usedByComponentBundle: true,
  },
  "elevation-interactive": {
    raw: "0 1px 2px rgba(0,0,0,0.35)",
    resolved: "0 1px 2px rgba(0,0,0,0.35)",
    usedByComponentBundle: true,
  },
  "elevation-menu": {
    raw: "0 10px 30px rgba(0,0,0,0.50),0 0 0 1px var(--border-subtle)",
    resolved: "0 10px 30px rgba(0,0,0,0.50),0 0 0 1px #2B3442",
    usedByComponentBundle: false,
  },
  "elevation-popover": {
    raw: "0 10px 30px rgba(0,0,0,0.50),0 0 0 1px var(--border-subtle)",
    resolved: "0 10px 30px rgba(0,0,0,0.50),0 0 0 1px #2B3442",
    usedByComponentBundle: true,
  },
  "elevation-raised": {
    raw: "0 4px 14px rgba(0,0,0,0.40)",
    resolved: "0 4px 14px rgba(0,0,0,0.40)",
    usedByComponentBundle: true,
  },
  "elevation-sticky-nav": {
    raw: "0 1px 0 var(--border-subtle)",
    resolved: "0 1px 0 #2B3442",
    usedByComponentBundle: false,
  },
  "glow-brand-hero": {
    raw: "0 0 60px var(--glow-violet-strong),0 0 120px var(--glow-violet)",
    resolved: "0 0 60px rgba(139,92,246,0.65),0 0 120px rgba(124,58,237,0.45)",
    usedByComponentBundle: false,
  },
  "glow-brand-medium": {
    raw: "0 0 0 1px var(--border-selected),0 0 32px var(--glow-violet-strong)",
    resolved: "0 0 0 1px #8B5CF6,0 0 32px rgba(139,92,246,0.65)",
    usedByComponentBundle: false,
  },
  "glow-brand-subtle": {
    raw: "0 0 0 1px var(--border-interactive),0 0 18px var(--glow-violet)",
    resolved: "0 0 0 1px #7C3AED,0 0 18px rgba(124,58,237,0.45)",
    usedByComponentBundle: true,
  },
  "glow-error": {
    raw: "0 0 14px rgba(240,71,91,0.34)",
    resolved: "0 0 14px rgba(240,71,91,0.34)",
    usedByComponentBundle: true,
  },
  "glow-focus": {
    raw: "0 0 0 2px var(--bg-canvas),0 0 0 4px var(--border-focus),0 0 18px var(--glow-violet)",
    resolved: "0 0 0 2px #070A0F,0 0 0 4px #A78BFA,0 0 18px rgba(124,58,237,0.45)",
    usedByComponentBundle: true,
  },
  "glow-signal": {
    raw: "0 0 14px var(--glow-cyan)",
    resolved: "0 0 14px rgba(34,211,238,0.40)",
    usedByComponentBundle: true,
  },
  "glow-signal-strong": {
    raw: "0 0 26px var(--glow-cyan),0 0 60px rgba(34,211,238,0.18)",
    resolved: "0 0 26px rgba(34,211,238,0.40),0 0 60px rgba(34,211,238,0.18)",
    usedByComponentBundle: false,
  },
  "glow-success": {
    raw: "0 0 14px rgba(47,191,113,0.34)",
    resolved: "0 0 14px rgba(47,191,113,0.34)",
    usedByComponentBundle: true,
  },
  "glow-white-edge": {
    raw: "inset 0 1px 0 var(--glow-white)",
    resolved: "inset 0 1px 0 rgba(248,250,252,0.12)",
    usedByComponentBundle: true,
  },
} as const;

export type ElevationAndGlowShadowsVarName = keyof typeof elevationAndGlowShadows;

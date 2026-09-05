import { cva } from "class-variance-authority";

import type { QPProductBadgeProduct } from "./product-badge.types";

/**
 * QPProductBadge — class maps and fixed values.
 */

/**
 * Default display names.
 *
 * These are brand *proper nouns*, not translatable UI copy, which is why this
 * package is allowed to ship them at all. They remain fully overridable via
 * `children`; export exists so an app can build a localised or transliterated
 * map from the same keys instead of duplicating the union.
 */
export const QP_PRODUCT_BADGE_NAMES = {
  qpmatrix: "QPMatrix",
  assistant: "QP Assistant",
  antigravity: "Antigravity",
  claudeCode: "Claude Code",
  codex: "Codex",
  pi: "Pi",
  jiraBoard: "Jira",
  githubPipelines: "GitHub",
  discord: "Discord",
  discordTeam: "Discord Team",
} as const satisfies Record<QPProductBadgeProduct, string>;

/**
 * Per-product tone. Token roles only — a product's colour is a recognition
 * aid, never the thing that says which product it is.
 *
 * Chips on a `status-*-bg` tint set their text to `fg-primary` rather than to
 * the matching `status-*` hue. That is a MEASURED decision, not a preference:
 * status-coloured text on its own tint clears 4.5:1 in neither theme
 * consistently (success 6.22 dark / 3.15 light, warning 7.19 / 2.76, info
 * 4.23 / 4.50), while `fg-primary` on the same tints measures 13.9-17.1:1 in
 * both. The tint still distinguishes the product, and the product NAME is
 * always rendered as text — so nothing is lost by making the text legible.
 * The same applies to the brand and signal tints: `brand-primary` on
 * `brand-subtle` measures 4.24:1 (dark) and 4.64:1 (light) — the dark theme
 * fails 4.5:1. Found by running axe over the built Storybook in a real
 * browser, which is the only place a translucent tint like
 * `rgba(139,92,246,0.12)` composited over the canvas can be measured.
 *
 * See `APPROVED_CONTRAST_PAIRS` in src/testing/contrast.ts.
 */
export const qpProductBadgeVariants = cva("font-medium", {
  variants: {
    product: {
      qpmatrix: "bg-brand-subtle text-fg-primary",
      assistant: "bg-status-info-bg text-fg-primary",
      antigravity: "bg-surface-tertiary text-fg-primary",
      claudeCode: "bg-status-warning-bg text-fg-primary",
      codex: "bg-surface-tertiary text-fg-secondary",
      pi: "bg-status-success-bg text-fg-primary",
      jiraBoard: "bg-surface-interactive text-fg-primary",
      githubPipelines: "bg-surface-secondary text-fg-primary",
      discord: "bg-brand-subtle text-fg-primary",
      discordTeam: "bg-surface-interactive text-fg-secondary",
    } satisfies Record<QPProductBadgeProduct, string>,
  },
  defaultVariants: {
    product: "qpmatrix",
  },
});

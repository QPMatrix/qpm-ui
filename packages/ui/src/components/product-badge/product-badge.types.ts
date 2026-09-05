import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";

import type { Badge } from "../ui/badge";
import type { qpProductBadgeVariants } from "./product-badge.constants";

/**
 * QPProductBadge — public type surface.
 */

/** The QPMatrix product surfaces this chip can name. */
export type QPProductBadgeProduct =
  | "qpmatrix"
  | "assistant"
  | "antigravity"
  | "claudeCode"
  | "codex"
  | "pi"
  | "jiraBoard"
  | "githubPipelines"
  | "discord"
  | "discordTeam";

/** The props `ui/badge` accepts, re-exported so wrappers derive from one source. */
export type QPProductBadgePrimitiveProps = ComponentProps<typeof Badge>;

export interface QPProductBadgeProps
  extends
    Omit<QPProductBadgePrimitiveProps, "variant" | "children" | "className">,
    VariantProps<typeof qpProductBadgeVariants> {
  /**
   * Which QPMatrix product this chip names. Drives the tone and the default
   * display name — but the name is always rendered as text, so the tone is a
   * redundant cue and never the carrier of meaning (WCAG 2.2 SC 1.4.1).
   */
  product: QPProductBadgeProduct;
  /**
   * Overrides the default display name from `QP_PRODUCT_BADGE_NAMES`. Must stay
   * readable text. Pass this to render localised or transliterated copy:
   *
   * ```tsx
   * <QPProductBadge product="assistant">{t("products.assistant")}</QPProductBadge>
   * ```
   */
  children?: ReactNode;
  /**
   * Narrowed from Base UI's `string | ((state) => string)` to a plain string:
   * `cn()` merges class *values*, not class-producing callbacks.
   */
  className?: string | undefined;
}

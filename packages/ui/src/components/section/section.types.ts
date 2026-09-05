import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";

import type { QPHeadingLevel, QPHeadingVariant } from "../heading/heading.types";
import type { QPTextTone } from "../text/text.types";
import type { qpSectionVariants } from "./section.constants";

/**
 * QPSection — public type surface.
 */

/** Vertical rhythm between a section and its neighbours. */
export type QPSectionSpacing = "none" | "compact" | "default" | "spacious";

/** The surface a section paints behind itself. */
export type QPSectionSurface = "none" | "subtle" | "raised" | "brand";

/** Horizontal alignment of the section's own header block. */
export type QPSectionAlign = "start" | "center";

export interface QPSectionProps
  extends
    Omit<ComponentProps<"div">, "children" | "className" | "title">,
    VariantProps<typeof qpSectionVariants> {
  /**
   * The section's visible heading. Optional, but a section WITHOUT one is not
   * a landmark worth having — see `label`.
   */
  heading?: ReactNode;
  /**
   * Outline level for `heading`. Required whenever `heading` is set: a section
   * heading that picks its own level by visual size breaks the page outline
   * (WCAG 2.2 SC 1.3.1).
   */
  level?: QPHeadingLevel;
  /** Type ramp step for the heading. Defaults to the one matching `level`. */
  headingVariant?: QPHeadingVariant;
  /**
   * Accessible name when there is no visible `heading`.
   *
   * A `<section>` with no accessible name is NOT exposed as a landmark by
   * screen readers — it is an anonymous group, which is worse than a `<div>`
   * because it implies structure that cannot be navigated to. Give it a
   * heading or give it a label.
   */
  label?: string;
  /** Supporting sentence under the heading. */
  description?: ReactNode;
  /** Rendered opposite the heading — a filter, a "view all" link. */
  action?: ReactNode;
  /** Small overline above the heading — a category or step number. */
  eyebrow?: ReactNode;
  /** Tone for `description`. Defaults to `muted`. */
  descriptionTone?: QPTextTone;
  /** Vertical rhythm. Defaults to `default`. */
  spacing?: QPSectionSpacing;
  /** Background surface. Defaults to `none`. */
  surface?: QPSectionSurface;
  /** Header alignment. Defaults to `start`. */
  align?: QPSectionAlign;
  /**
   * Animate the section in as it scrolls into view.
   *
   * This is what makes a long page feel alive rather than pre-assembled.
   * Automatically collapses to a cross-fade under `prefers-reduced-motion`.
   */
  reveal?: boolean;
  /** Section content. */
  children?: ReactNode;
  className?: string | undefined;
}

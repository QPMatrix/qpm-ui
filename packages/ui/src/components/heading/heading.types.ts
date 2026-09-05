import type { ComponentProps, ReactNode } from "react";

import type { QPTextTone, QPTextVariant } from "../text/text.types";

/**
 * QPHeading — public type surface.
 */

/** Every tag QPHeading may emit — the six heading levels, plus `plain`. */
export type QPHeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span";

/** Document outline level. `1` renders `<h1>`, `2` renders `<h2>`, and so on. */
export type QPHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** Type ramp steps a heading is allowed to look like. */
export type QPHeadingVariant = Extract<
  QPTextVariant,
  "display-lg" | "display-md" | "h1" | "h2" | "h3" | "h4" | "body-lg" | "label"
>;

export interface QPHeadingProps extends Omit<ComponentProps<"h2">, "children" | "className"> {
  /**
   * The DOCUMENT OUTLINE level — what this heading IS. Required, and never
   * inferred from the visual size.
   *
   * Screen-reader users navigate a page by jumping between headings, and the
   * levels are the structure they are jumping through. A page whose levels
   * follow the type sizes a designer chose (h1, then h4 because it looked
   * better, then h2) is unnavigable, and it is a WCAG 2.2 SC 1.3.1 failure.
   */
  level: QPHeadingLevel;
  /**
   * How the heading LOOKS. Defaults to the ramp step matching `level`.
   *
   * Set it when the visual weight and the outline position genuinely differ —
   * a section that is outline-level 3 but needs display weight because it
   * opens a page.
   */
  variant?: QPHeadingVariant;
  /** Semantic colour. Defaults to `primary`. */
  tone?: QPTextTone;
  /**
   * Render a `<span>` instead of `<h1>`–`<h6>`, keeping only the type style.
   *
   * For text that looks like a heading but is not one — a card title inside a
   * list of a hundred cards, where a hundred real headings would flood the
   * outline. The escape hatch is explicit so it shows up in review.
   */
  plain?: boolean;
  /** Text alignment. Logical, so it flips under RTL. */
  align?: "start" | "center" | "end";
  /** Heading content. */
  children?: ReactNode;
  className?: string | undefined;
}

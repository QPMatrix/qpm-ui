import { createElement, type ElementType } from "react";

import { cn } from "../../lib/utils";
import { qpTextVariants } from "../text/text.constants";
import type { QPHeadingProps } from "./heading.types";
import { qpHeadingTag, qpHeadingVariant } from "./heading.utils";

/**
 * QPHeading — a heading whose outline level is a deliberate decision.
 *
 * `level` says what the heading IS in the document outline; `variant` says
 * what it LOOKS like. They default to agreeing, and either can be set alone.
 *
 * The reason this component exists rather than `<h2 className="text-h2">` is
 * that the two decisions get conflated the moment they share a syntax. Screen
 * reader users navigate long pages by jumping heading to heading, and the
 * levels are the structure they jump through — so a page whose levels follow
 * the type sizes a designer liked (h1, then h4 because it fit, then h2) is
 * genuinely unnavigable, and it fails WCAG 2.2 SC 1.3.1. Requiring `level`
 * makes the outline something you state rather than something that happens.
 *
 * ```tsx
 * <QPHeading level={1} variant="display-lg">Pipelines</QPHeading>
 * <QPHeading level={2}>Recent runs</QPHeading>
 * <QPHeading level={3} plain>Build #4102</QPHeading>
 * ```
 */
export function QPHeading({
  level,
  variant,
  tone,
  plain = false,
  align,
  className,
  children,
  ...props
}: QPHeadingProps) {
  const resolvedVariant = qpHeadingVariant(level, variant);
  // Annotated, not asserted — see the note in QPText. A union of six heading
  // tags has an intersection of prop types, so `ref` could not satisfy them
  // all; `ElementType` is the honest widening.
  const Component: ElementType = qpHeadingTag(level, plain);

  // `createElement`, for the same reason as QPText: JSX resolves a union
  // component to the intersection of its props.
  return createElement(
    Component,
    {
      "data-slot": "heading",
      "data-level": level,
      className: cn(qpTextVariants({ variant: resolvedVariant, tone, align }), className),
      ...props,
    },
    children,
  );
}

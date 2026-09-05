import { createElement, type ElementType } from "react";

import { cn } from "../../lib/utils";
import { qpTextVariants } from "./text.constants";
import type { QPTextProps } from "./text.types";
import { qpDefaultTextElement, qpTextClampClass, qpTextFontClass } from "./text.utils";

/**
 * QPText — every piece of text in a QPMatrix surface.
 *
 * The kit's whole type ramp is one prop. `variant` selects a step from
 * @qpmatrix/tokens (`display-lg` … `caption`, plus `code` and the `metric-*`
 * dashboard figures), and each step carries size, line-height, tracking and
 * weight together — so a heading cannot be half-styled, and a designer
 * changing the ramp changes it in the tokens rather than in fifty files.
 *
 * `variant` and `as` are separate on purpose. How text LOOKS and what it IS
 * are different decisions: a visual `h2` at the top of a card is very often
 * not an outline-level-2 heading, and conflating the two is how a page ends up
 * with a document outline that no screen-reader user can navigate. When the
 * outline IS the point, use `QPHeading`.
 *
 * ```tsx
 * <QPText variant="display-lg" as="span">4.2M</QPText>
 * <QPText variant="body" tone="muted">Rolling 7-day window</QPText>
 * <QPText variant="body" font="arabic" dir="rtl">مرحبا</QPText>
 * ```
 */
export function QPText({
  variant = "body",
  as,
  tone,
  font,
  clamp,
  tabular,
  align,
  className,
  children,
  ...props
}: QPTextProps) {
  /*
   * Annotated as `ElementType`, not asserted to a tag.
   *
   * A union of intrinsic tags (`"p" | "label" | …`) has an INTERSECTION of
   * prop types, so JSX would demand a `ref` that is an HTMLParagraphElement
   * and an HTMLLabelElement at once — impossible for any value. Widening the
   * variable to `ElementType` is an ordinary assignment (every member of the
   * union IS an ElementType), so nothing is asserted away; what a caller may
   * pass is still constrained by `QPTextProps`.
   */
  const Component: ElementType = as ?? qpDefaultTextElement(variant);

  /*
   * `createElement` rather than `<Component>`.
   *
   * `ElementType` is the union of every intrinsic tag, and JSX resolves a union
   * component to the INTERSECTION of their props — so it would demand a `ref`
   * that is an HTMLParagraphElement and an HTMLLabelElement at once. Passing
   * the props as an ordinary object sidesteps that without asserting anything
   * away; `QPTextProps` is still what constrains the caller.
   */
  return createElement(
    Component,
    {
      "data-slot": "text",
      "data-variant": variant,
      className: cn(
        qpTextVariants({ variant, tone, align, tabular }),
        qpTextFontClass(font),
        qpTextClampClass(clamp),
        className,
      ),
      ...props,
    },
    children,
  );
}

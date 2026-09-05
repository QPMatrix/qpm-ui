import { createElement, type ElementType } from "react";

import { cn } from "../../lib/utils";
import { QPMotion } from "../motion";
import { qpPageContainerVariants } from "./page-container.constants";
import type { QPPageContainerProps } from "./page-container.types";

/**
 * QPPageContainer — the measure every page is written inside.
 *
 * It answers two questions once, at the page level, instead of per section:
 * how wide should the content be, and how much room does it get above and
 * below. Both are token-scaled props, so a marketing page (`prose`), an app
 * screen (`content`) and a dashboard (`wide`) differ by one word rather than
 * by a different set of hand-tuned utilities each time.
 *
 * `as="main"` makes it the page's `main` landmark. Exactly one element per
 * page may be — it is what "skip to content" lands on — so the prop is
 * explicit rather than defaulted, and the default (`div`) is the safe one.
 *
 * ```tsx
 * <QPPageContainer as="main" width="content">
 *   <QPSection heading="Pipelines" level={1}>…</QPSection>
 * </QPPageContainer>
 * ```
 */
export function QPPageContainer({
  width,
  padding,
  as = "div",
  animate = false,
  className,
  children,
  ...props
}: QPPageContainerProps) {
  const classes = cn(qpPageContainerVariants({ width, padding }), className);

  if (animate) {
    return (
      <QPMotion as={as} variant="rise" data-slot="page-container" className={classes} {...props}>
        {children}
      </QPMotion>
    );
  }

  // Annotated, not asserted — see the note in QPText.
  const Component: ElementType = as;

  // `createElement`, for the same reason as QPText.
  return createElement(
    Component,
    { "data-slot": "page-container", className: classes, ...props },
    children,
  );
}

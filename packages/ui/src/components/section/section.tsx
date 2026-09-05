import { useId } from "react";

import { cn, isRenderable } from "../../lib/utils";
import { QPReveal } from "../reveal";
import { QPHeading } from "../heading";
import { QPText } from "../text";
import {
  QP_SECTION_ALIGN_CLASSES,
  QP_SECTION_HEADER_GAP,
  qpSectionVariants,
} from "./section.constants";
import type { QPSectionProps } from "./section.types";
import { qpHasSectionHeader, qpSectionLevel, qpSectionNaming } from "./section.utils";

/**
 * QPSection — a titled block of a page.
 *
 * Pages are built from these: an optional eyebrow, a heading at a stated
 * outline level, a description, an action, and the content. Because the header
 * block is assembled here rather than at each call site, every section on
 * every QPMatrix surface has the same internal rhythm and the same
 * heading-to-content relationship.
 *
 * Two things it enforces that hand-written markup routinely gets wrong:
 *
 *   1. It renders a `<section>` only when it has an accessible name. An
 *      unnamed `<section>` is not a landmark — screen readers expose it as an
 *      anonymous group, which implies navigable structure that isn't there. No
 *      heading and no `label` gets you a plain `<div>` instead.
 *   2. The heading's outline level is a prop, never inferred from its size.
 *
 * `reveal` animates the section in as the reader reaches it, which is what
 * makes a long page feel alive rather than pre-assembled. It degrades to a
 * cross-fade under `prefers-reduced-motion` automatically.
 *
 * ```tsx
 * <QPSection heading="Recent runs" level={2} description="Last 24 hours" reveal>
 *   <QPTable … />
 * </QPSection>
 * ```
 */
export function QPSection({
  heading,
  level,
  headingVariant,
  label,
  description,
  action,
  eyebrow,
  descriptionTone = "muted",
  spacing,
  surface,
  align = "start",
  reveal = false,
  className,
  children,
  ...props
}: QPSectionProps) {
  const generatedId = useId();
  const headingId = `${generatedId}-heading`;
  const naming = qpSectionNaming(heading, label);
  const showHeader = qpHasSectionHeader({ heading, description, action, eyebrow });

  const namingProps =
    naming === "labelledby"
      ? { "aria-labelledby": headingId }
      : naming === "label"
        ? { "aria-label": label }
        : {};

  const header = showHeader ? (
    <div
      data-slot="section-header"
      className={cn(
        "flex flex-col gap-2",
        align === "center" ? QP_SECTION_ALIGN_CLASSES.center : QP_SECTION_ALIGN_CLASSES.start,
      )}
    >
      <div className="flex w-full items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          {isRenderable(eyebrow) ? (
            <QPText
              variant="label-sm"
              tone="brand"
              as="span"
              data-slot="section-eyebrow"
              className="uppercase"
            >
              {eyebrow}
            </QPText>
          ) : null}
          {isRenderable(heading) ? (
            <QPHeading
              id={headingId}
              level={qpSectionLevel(level)}
              {...(headingVariant === undefined ? {} : { variant: headingVariant })}
              data-slot="section-heading"
            >
              {heading}
            </QPHeading>
          ) : null}
        </div>
        {isRenderable(action) ? (
          <div data-slot="section-action" className="shrink-0">
            {action}
          </div>
        ) : null}
      </div>
      {isRenderable(description) ? (
        <QPText variant="body" tone={descriptionTone} data-slot="section-description">
          {description}
        </QPText>
      ) : null}
    </div>
  ) : null;

  const content = (
    <>
      {header}
      {isRenderable(children) ? <div data-slot="section-content">{children}</div> : null}
    </>
  );

  const classes = cn(qpSectionVariants({ spacing, surface }), QP_SECTION_HEADER_GAP, className);

  // An unnamed section is deliberately downgraded to a div: see the naming
  // rule in `.utils.ts`. `props` is spread onto whichever element is chosen.
  if (naming === "none") {
    return (
      <div data-slot="section" className={classes} {...props}>
        {content}
      </div>
    );
  }

  if (reveal) {
    return (
      <QPReveal
        as="section"
        variant="reveal"
        data-slot="section"
        className={classes}
        {...namingProps}
        {...props}
      >
        {content}
      </QPReveal>
    );
  }

  return (
    <section data-slot="section" className={classes} {...namingProps} {...props}>
      {content}
    </section>
  );
}

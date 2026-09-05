import { cva } from "class-variance-authority";

import type { QPProseSize, QPProseWidth } from "./prose.types";

/**
 * QPProse — class maps and fixed values.
 *
 * These are descendant selectors, which the rest of the kit avoids on
 * principle. Prose is the one justified exception: the markup comes from a
 * Markdown compiler, so there is no call site to put a class on. Every rule
 * below is scoped under `[data-slot="prose"]` by virtue of living in this
 * component's class list, and every value is a token role.
 */

export const QP_PROSE_WIDTH_CLASSES = {
  measure: "max-w-[68ch]",
  full: "max-w-none",
} as const satisfies Record<QPProseWidth, string>;

export const QP_PROSE_SIZE_CLASSES = {
  sm: "[&>p]:text-body-sm [&>ul]:text-body-sm [&>ol]:text-body-sm",
  default: "[&>p]:text-body [&>ul]:text-body [&>ol]:text-body",
  lg: "[&>p]:text-body-lg [&>ul]:text-body-lg [&>ol]:text-body-lg",
} as const satisfies Record<QPProseSize, string>;

/**
 * The document styles.
 *
 * Headings use `scroll-mt-24` so an in-page anchor does not land the heading
 * under a sticky header — the single most common complaint about generated
 * documentation, and invisible until someone follows a deep link.
 *
 * Lists use `ms-*` and links use logical spacing so Arabic and Hebrew content
 * lays out correctly without a second stylesheet.
 */
export const QP_PROSE_ELEMENT_CLASSES = [
  // Headings
  "[&_h1]:text-h1 [&_h1]:font-display [&_h1]:text-fg-primary [&_h1]:scroll-mt-24",
  "[&_h2]:text-h2 [&_h2]:font-display [&_h2]:text-fg-primary [&_h2]:scroll-mt-24 [&_h2]:mt-10",
  "[&_h3]:text-h3 [&_h3]:text-fg-primary [&_h3]:scroll-mt-24 [&_h3]:mt-8",
  "[&_h4]:text-h4 [&_h4]:text-fg-primary [&_h4]:scroll-mt-24 [&_h4]:mt-6",

  // Body copy
  "[&_p]:text-fg-secondary [&_p]:mt-4",
  "[&_strong]:text-fg-primary [&_strong]:font-semibold",
  "[&_em]:italic",

  // Links: underlined, not colour-only. Colour alone as the sole indicator of
  // a link inside body text fails WCAG 2.2 SC 1.4.1.
  "[&_a]:text-brand-primary [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-border-interactive hover:[&_a]:decoration-brand-primary",

  // Lists — logical inline margin so RTL indents on the correct side.
  "[&_ul]:mt-4 [&_ul]:ms-5 [&_ul]:list-disc [&_ul]:text-fg-secondary",
  "[&_ol]:mt-4 [&_ol]:ms-5 [&_ol]:list-decimal [&_ol]:text-fg-secondary",
  "[&_li]:mt-2 [&_li]:ps-1",

  // Code
  "[&_code]:text-code [&_code]:font-mono [&_code]:rounded [&_code]:bg-surface-tertiary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-fg-primary",
  "[&_pre]:mt-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-surface-secondary [&_pre]:p-4",
  // A code block inside <pre> must not repeat the inline chip treatment.
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0",

  // Quotes — border on the inline-start edge, so it flips under RTL.
  "[&_blockquote]:mt-4 [&_blockquote]:border-s-2 [&_blockquote]:border-border-interactive [&_blockquote]:ps-4 [&_blockquote]:text-fg-muted [&_blockquote]:italic",

  // Tables
  "[&_table]:mt-6 [&_table]:w-full [&_table]:border-collapse [&_table]:text-body-sm",
  "[&_th]:border-b [&_th]:border-border-default [&_th]:pb-2 [&_th]:text-start [&_th]:font-medium [&_th]:text-fg-primary",
  "[&_td]:border-b [&_td]:border-border-subtle [&_td]:py-2 [&_td]:text-fg-secondary",

  // Media and rules
  "[&_img]:mt-6 [&_img]:rounded-lg",
  "[&_hr]:my-10 [&_hr]:border-border-subtle",
  "[&_figcaption]:text-caption [&_figcaption]:mt-2 [&_figcaption]:text-fg-muted",

  // The first element must not push the document down.
  "[&>*:first-child]:mt-0",
].join(" ");

export const qpProseVariants = cva(QP_PROSE_ELEMENT_CLASSES, {
  variants: {
    width: QP_PROSE_WIDTH_CLASSES,
    size: QP_PROSE_SIZE_CLASSES,
  },
  defaultVariants: {
    width: "measure",
    size: "default",
  },
});

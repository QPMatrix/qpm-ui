import { cva } from "class-variance-authority";

import type { QPMessageAuthor } from "./message-bubble.types";

/**
 * QPMessageBubble — class maps and fixed values.
 */

/**
 * Fallback author labels, in English.
 *
 * Exported so an app can spread and translate it rather than re-deriving the
 * key set. Every consumer shipping a non-English locale is expected to pass its
 * own map through `QPMessageBubble`'s `authorLabels` prop.
 */
export const QP_MESSAGE_BUBBLE_AUTHOR_LABELS = {
  user: "You",
  assistant: "Assistant",
  system: "System",
} as const satisfies Record<QPMessageAuthor, string>;

/** Announced while a message is awaiting server confirmation. Overridable. */
export const QP_MESSAGE_BUBBLE_DEFAULT_PENDING_LABEL = "Sending";

/**
 * Inline alignment uses logical margins (`ms-auto`/`me-auto`) so the
 * conversation still reads correctly in Arabic and Hebrew without a fork.
 *
 * The user bubble sits on `brand-strong`, not `brand-primary`: the latter
 * measures 4.04:1 against `brand-foreground` in dark mode — below 1.4.3's
 * 4.5:1 for normal text, and the documented waiver for that pair explicitly
 * says not to place body text on it. `brand-strong` measures 5.45:1 dark and
 * 7.94:1 light.
 */
export const qpMessageBubbleVariants = cva("flex w-fit flex-col text-start shadow-elevation-flat", {
  variants: {
    author: {
      user: "ms-auto bg-brand-strong text-brand-foreground",
      assistant: "me-auto bg-surface-secondary text-fg-primary",
      system:
        "ms-auto me-auto border border-border-subtle bg-surface-tertiary text-fg-secondary italic",
    } satisfies Record<QPMessageAuthor, string>,
    size: {
      default: "gap-1 rounded-lg px-3 py-2 text-sm",
      sm: "gap-0.5 rounded-md px-2.5 py-1.5 text-xs",
    },
    pending: {
      /*
       * Deliberately NOT `opacity-70`.
       *
       * Opacity on the bubble composites its text AND its background against
       * the page, dropping the user bubble to 2.92:1 in light mode — measured
       * by axe in a real browser. A pending message is exactly the one a user
       * most wants to re-read, so dimming it is both an accessibility failure
       * and the wrong instinct.
       *
       * The state is carried instead by a dashed edge (visible, non-colour)
       * plus `aria-busy` and the visually hidden "Sending" label the component
       * already renders.
       */
      true: "border border-dashed border-border-strong",
      false: "",
    },
  },
  defaultVariants: {
    author: "assistant",
    size: "default",
    pending: false,
  },
});

import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";

import type { qpMessageBubbleVariants } from "./message-bubble.constants";

/**
 * QPMessageBubble — public type surface.
 */

/**
 * Who produced a message.
 *
 * Drives the bubble's colour role AND the textual author label — never colour
 * alone. A role that exists only as a hue does not survive greyscale, and
 * inline alignment means nothing to a screen reader.
 */
export type QPMessageAuthor = "user" | "assistant" | "system";

export interface QPMessageBubbleProps
  extends
    Omit<ComponentProps<"article">, "children">,
    Omit<VariantProps<typeof qpMessageBubbleVariants>, "author" | "pending"> {
  /** Who produced this message. Selects the token role and the default label. */
  author: QPMessageAuthor;
  /** The message body. */
  children: ReactNode;
  /**
   * Accessible name for this bubble, also rendered as visually hidden text.
   * Takes precedence over `authorLabels`. Pass this when the name is dynamic
   * (a person's display name, say) rather than a fixed role.
   */
  authorLabel?: string;
  /**
   * Per-author labels, merged over {@link QP_MESSAGE_BUBBLE_AUTHOR_LABELS}, whose
   * English values are only a fallback — translate these for localised apps.
   */
  authorLabels?: Partial<Record<QPMessageAuthor, string>>;
  /** Rendered under the body — pass a formatted string or a `<time>` element. */
  timestamp?: ReactNode;
  /** The message has not been confirmed by the server yet. */
  pending?: boolean;
  /**
   * Visually hidden text announced while `pending`. Defaults to the English
   * `"Sending"`; override it for localised apps.
   */
  pendingLabel?: string;
}

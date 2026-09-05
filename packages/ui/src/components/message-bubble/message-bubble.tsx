"use client";

import { useId } from "react";

import { cn, isRenderable } from "../../lib/utils";
import {
  QP_MESSAGE_BUBBLE_DEFAULT_PENDING_LABEL,
  qpMessageBubbleVariants,
} from "./message-bubble.constants";
import type { QPMessageBubbleProps } from "./message-bubble.types";
import { qpResolveMessageAuthorLabel } from "./message-bubble.utils";

/**
 * QPMessageBubble — a single chat message.
 *
 * Rendered as an `<article>` named by a visually hidden author label, so
 * assistive technology announces who spoke before the body. Sighted users get
 * the same information from the colour role and inline alignment, which use
 * logical margins so the conversation still reads correctly in Arabic and
 * Hebrew. Width, max-width and spacing beyond the `size` variant are the
 * consumer's call via `className`.
 */
export function QPMessageBubble({
  className,
  author,
  children,
  authorLabel,
  authorLabels,
  timestamp,
  size,
  pending = false,
  pendingLabel = QP_MESSAGE_BUBBLE_DEFAULT_PENDING_LABEL,
  ...props
}: QPMessageBubbleProps) {
  const generatedId = useId();
  const labelId = `${generatedId}-author`;
  const resolvedLabel = qpResolveMessageAuthorLabel(author, authorLabel, authorLabels);

  return (
    <article
      data-slot="message-bubble"
      data-author={author}
      data-pending={pending ? "true" : undefined}
      aria-labelledby={labelId}
      aria-busy={pending}
      className={cn(qpMessageBubbleVariants({ author, size, pending }), className)}
      {...props}
    >
      <span id={labelId} className="sr-only">
        {resolvedLabel}
      </span>
      <div data-slot="message-bubble-content" className="whitespace-pre-wrap">
        {children}
      </div>
      {isRenderable(timestamp) ? (
        <span
          data-slot="message-bubble-timestamp"
          /*
           * `opacity-90`, not `opacity-70`.
           *
           * Opacity dims the TEXT against the bubble it sits on, and the user
           * bubble is a saturated fill: at 70% the timestamp measured 3.43:1
           * in dark, below 4.5:1 for its 12px size. Measured in a real browser
           * — happy-dom composites nothing, so nothing in the unit suite could
           * see it. 90% measures 4.71:1 dark and 6.71:1 light, which keeps the
           * visual hierarchy while staying legible.
           */
          className="text-xs opacity-90"
        >
          {timestamp}
        </span>
      ) : null}
      {pending ? <span className="sr-only">{pendingLabel}</span> : null}
    </article>
  );
}

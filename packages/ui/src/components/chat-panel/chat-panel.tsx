import { useId } from "react";

import { cn, isRenderable } from "../../lib/utils";
import { Separator } from "../ui/separator";
import { QP_CHAT_PANEL_LIST_CLASSES, qpChatPanelVariants } from "./chat-panel.constants";
import type { QPChatPanelProps } from "./chat-panel.types";
import { qpHasMessages, qpMessageListLiveAttributes } from "./chat-panel.utils";

/**
 * QPChatPanel — the conversation surface: header, scrollable message list, footer.
 *
 * It is a LAYOUT, not a controller. It holds no message state, imposes no
 * message shape, and fetches nothing — the caller passes `QPMessageBubble`
 * children (or anything else) and a `QPComposer` as `footer`. That is what makes
 * it reusable across the assistant, support and agent-log surfaces rather than
 * being one product's chat screen.
 *
 * Accessibility this panel owns, because nothing it composes can:
 *   - The root is a named `<section>` (a `region` landmark), so a screen-reader
 *     user can jump straight to the conversation.
 *   - The message list is `tabIndex={0}`: an overflow container that only a
 *     mouse can scroll is a WCAG 2.2 SC 2.1.1 failure, and a `<div>` with
 *     `overflow-y-auto` is not focusable on its own.
 *   - The list is labelled separately from the panel, so "Conversation,
 *     region" and "Messages, region" do not collapse into one announcement.
 */
export function QPChatPanel({
  label,
  title,
  headerAction,
  children,
  empty,
  footer,
  listLabel,
  liveMessages = false,
  variant,
  size,
  className,
  listClassName,
  ...props
}: QPChatPanelProps) {
  const generatedId = useId();
  const titleId = `${generatedId}-title`;
  const showTitle = isRenderable(title);
  const showHeader = showTitle || isRenderable(headerAction);
  const populated = qpHasMessages(children);

  return (
    <section
      data-slot="chat-panel"
      // A visible heading names the panel when there is one; `label` is the
      // fallback. Setting both would make AT read the name twice.
      {...(showTitle ? { "aria-labelledby": titleId } : { "aria-label": label })}
      className={cn(qpChatPanelVariants({ variant, size }), className)}
      {...props}
    >
      {showHeader ? (
        <>
          <header
            data-slot="chat-panel-header"
            className="flex shrink-0 items-center justify-between gap-2 px-3 py-2"
          >
            {showTitle ? (
              <h2 id={titleId} data-slot="chat-panel-title" className="text-sm font-medium">
                {title}
              </h2>
            ) : null}
            {isRenderable(headerAction) ? (
              <div data-slot="chat-panel-header-action" className="flex items-center gap-1">
                {headerAction}
              </div>
            ) : null}
          </header>
          <Separator />
        </>
      ) : null}

      <div
        data-slot="chat-panel-messages"
        role="log"
        tabIndex={0}
        aria-label={listLabel ?? label}
        {...qpMessageListLiveAttributes(liveMessages)}
        className={cn(QP_CHAT_PANEL_LIST_CLASSES, listClassName)}
      >
        {populated ? children : isRenderable(empty) ? empty : null}
      </div>

      {isRenderable(footer) ? (
        <>
          <Separator />
          <div data-slot="chat-panel-footer" className="shrink-0 p-3">
            {footer}
          </div>
        </>
      ) : null}
    </section>
  );
}

import { Children, type ReactNode } from "react";

import { isRenderable } from "../../lib/utils";

/**
 * QPChatPanel — pure helpers.
 */

/**
 * Does `children` contain anything to show?
 *
 * `isRenderable` alone is not enough for a list: `messages.map(...)` on an
 * empty array yields `[]`, which is neither null nor undefined but renders
 * nothing. Without this the empty state would never appear for the most common
 * way a caller passes messages. `Children.toArray` also drops nulls and
 * booleans, so a list of conditionally-rendered messages that all resolve to
 * `false` correctly counts as empty.
 */
export function qpHasMessages(children: ReactNode): boolean {
  if (!isRenderable(children)) {
    return false;
  }
  return Children.toArray(children).length > 0;
}

/**
 * The live-region attributes for the message list, or nothing.
 *
 * `aria-relevant="additions"` rather than the default `additions text`: chat
 * history is re-rendered constantly (timestamps tick, pending flags clear) and
 * announcing every text mutation turns the list into noise. Only appended
 * messages are worth interrupting the user for.
 */
export function qpMessageListLiveAttributes(live: boolean): Record<string, string> {
  return live ? { "aria-live": "polite", "aria-relevant": "additions" } : {};
}

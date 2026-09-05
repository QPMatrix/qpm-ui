import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";

import type { qpChatPanelVariants } from "./chat-panel.constants";

/**
 * QPChatPanel — public type surface.
 */
export interface QPChatPanelProps
  extends Omit<ComponentProps<"section">, "title">, VariantProps<typeof qpChatPanelVariants> {
  /**
   * Accessible name for the whole panel. Required: a landmark region with no
   * name is invisible in a screen reader's landmark list, which is the only
   * fast way to jump into a conversation (WCAG 2.2 SC 2.4.1).
   */
  label: string;
  /**
   * Visible heading. Optional — when present it names the panel instead of
   * `label`, so the two do not double up in the accessibility tree.
   */
  title?: ReactNode;
  /** Rendered opposite the title — a status indicator, a menu trigger. */
  headerAction?: ReactNode;
  /**
   * The message list. Pass `QPMessageBubble` elements, or your own; QPChatPanel
   * imposes no message shape and holds no message state.
   */
  children?: ReactNode;
  /**
   * Rendered in place of `children` when there are no messages. Pass your own
   * empty state — this package ships no illustration and no copy.
   */
  empty?: ReactNode;
  /** Rendered under the list — normally a `QPComposer`. */
  footer?: ReactNode;
  /**
   * Accessible name of the scrollable message list. Defaults to `label`;
   * override when the list needs a distinct name from the panel.
   */
  listLabel?: string;
  /**
   * Announce newly appended messages politely. Leave off for a list the user
   * is reading back through — a live region that fires on scroll-loaded
   * history is actively hostile.
   */
  liveMessages?: boolean;
  /** Extra classes for the scrollable list element, merged through `cn()` last. */
  listClassName?: string;
}

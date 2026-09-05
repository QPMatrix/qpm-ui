import { cva } from "class-variance-authority";

/**
 * QPChatPanel — class maps and fixed values.
 */

export const qpChatPanelVariants = cva(
  "flex min-h-0 flex-col overflow-hidden bg-surface-primary text-fg-primary",
  {
    variants: {
      variant: {
        /** Sits inside an existing surface — no chrome of its own. */
        plain: "",
        /** Free-standing card with a border and rounded corners. */
        card: "rounded-xl border border-border-subtle shadow-elevation-raised",
      },
      size: {
        default: "gap-0 text-sm",
        sm: "gap-0 text-xs",
      },
    },
    defaultVariants: {
      variant: "card",
      size: "default",
    },
  },
);

/**
 * The message list. `overscroll-contain` stops a scroll that reaches the top of
 * the history from chaining to the page behind it, which on a chat surface
 * reads as the whole app jumping while you scroll back through messages.
 *
 * `tabindex` is added by the component, not here: a scrollable region must be
 * keyboard-scrollable, and a `<div>` with overflow is not focusable by default
 * (WCAG 2.2 SC 2.1.1).
 */
export const QP_CHAT_PANEL_LIST_CLASSES =
  "flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain p-3 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-border-focus";

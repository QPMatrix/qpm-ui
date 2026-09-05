import type { Meta, StoryObj } from "@storybook/react-vite";
import { X } from "lucide-react";

import { QPComposer } from "../composer";
import { QPIconButton } from "../icon-button";
import { QPMessageBubble } from "../message-bubble";
import { QPStatusIndicator } from "../status-indicator";
import { QPTypingIndicator } from "../typing-indicator";
import { QPChatPanel } from "./chat-panel";

const meta = {
  title: "Components/QPChatPanel",
  component: QPChatPanel,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    title: { control: "text" },
    listLabel: { control: "text" },
    liveMessages: { control: "boolean" },
    variant: { control: "select", options: ["card", "plain"] },
    size: { control: "select", options: ["default", "sm"] },
  },
} satisfies Meta<typeof QPChatPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const conversation = [
  <QPMessageBubble key="1" author="user">
    Which package owns the design tokens?
  </QPMessageBubble>,
  <QPMessageBubble key="2" author="assistant">
    {"@qpmtx/tokens. @qpmtx/ui consumes them through styles/qpmatrix.css."}
  </QPMessageBubble>,
  <QPMessageBubble key="3" author="user">
    Can I add one without touching the UI package?
  </QPMessageBubble>,
];

export const Default: Story = {
  args: {
    label: "Conversation",
    title: "QP Assistant",
    listLabel: "Messages",
    className: "h-96 max-w-xl",
    children: conversation,
  },
};

/** The full surface: header status, message list, composer in the footer. */
export const WithComposer: Story = {
  args: {
    label: "Conversation",
    title: "QP Assistant",
    listLabel: "Messages",
    className: "h-[28rem] max-w-xl",
    headerAction: (
      <>
        <QPStatusIndicator status="connected" size="sm">
          Connected
        </QPStatusIndicator>
        <QPIconButton label="Close conversation" variant="ghost" size="sm">
          <X />
        </QPIconButton>
      </>
    ),
    children: [...conversation, <QPTypingIndicator key="typing" />],
    footer: <QPComposer label="Message" submitLabel="Send" placeholder="Ask about the codebase…" />,
  },
};

/** Empty state is a prop — this package ships no illustration and no copy. */
export const Empty: Story = {
  args: {
    label: "Conversation",
    title: "QP Assistant",
    className: "h-96 max-w-xl",
    empty: (
      <div className="m-auto max-w-xs text-center text-sm text-fg-muted">
        No messages yet. Ask a question to get started.
      </div>
    ),
    footer: <QPComposer label="Message" submitLabel="Send" />,
  },
};

/** `plain` drops the card chrome for panels embedded in an existing surface. */
export const Plain: Story = {
  args: {
    label: "Conversation",
    variant: "plain",
    className: "h-80 max-w-xl",
    children: conversation,
  },
};

export const RightToLeft: Story = {
  args: {
    label: "المحادثة",
    title: "المساعد",
    listLabel: "الرسائل",
    className: "h-96 max-w-xl",
    children: [
      <QPMessageBubble key="1" author="user" authorLabels={{ user: "أنت" }}>
        من يملك رموز التصميم؟
      </QPMessageBubble>,
      <QPMessageBubble key="2" author="assistant" authorLabels={{ assistant: "المساعد" }}>
        حزمة الرموز.
      </QPMessageBubble>,
    ],
    footer: <QPComposer label="الرسالة" submitLabel="إرسال" />,
  },
  render: (args) => (
    <div dir="rtl">
      <QPChatPanel {...args} />
    </div>
  ),
};

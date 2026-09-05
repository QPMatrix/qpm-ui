import type { Meta, StoryObj } from "@storybook/react-vite";

import { QPMessageBubble } from "./message-bubble";

const meta = {
  title: "Components/QPMessageBubble",
  component: QPMessageBubble,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    author: { control: "select", options: ["user", "assistant", "system"] },
    size: { control: "select", options: ["default", "sm"] },
    pending: { control: "boolean" },
    authorLabel: { control: "text" },
    pendingLabel: { control: "text" },
  },
} satisfies Meta<typeof QPMessageBubble>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Assistant: Story = {
  args: {
    author: "assistant",
    children: "I've indexed the repository. Ask me anything about it.",
    className: "max-w-md",
  },
};

export const User: Story = {
  args: {
    author: "user",
    children: "Which package owns the design tokens?",
    className: "max-w-md",
  },
};

export const System: Story = {
  args: {
    author: "system",
    children: "Conversation moved to the engineering workspace.",
    className: "max-w-md",
  },
};

export const WithTimestamp: Story = {
  args: {
    author: "user",
    children: "Shipping this now.",
    timestamp: <time dateTime="2026-08-12T09:00">09:00</time>,
    className: "max-w-md",
  },
};

/** Optimistic send: dimmed, `aria-busy`, and announced as pending. */
export const Pending: Story = {
  args: {
    author: "user",
    children: "Shipping this now.",
    pending: true,
    className: "max-w-md",
  },
};

export const Compact: Story = {
  args: {
    author: "assistant",
    size: "sm",
    children: "Done.",
    className: "max-w-md",
  },
};

/** A whole exchange, showing how alignment reads as turn-taking. */
export const Conversation: Story = {
  args: { author: "assistant", children: "" },
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-2">
      <QPMessageBubble author="user">Which package owns the design tokens?</QPMessageBubble>
      <QPMessageBubble author="assistant">
        {"@qpmatrix/tokens. @qpmatrix/ui consumes them through styles/qpmatrix.css."}
      </QPMessageBubble>
      <QPMessageBubble author="user" pending>
        Can I add one?
      </QPMessageBubble>
    </div>
  ),
};

/**
 * Logical margins mean the same component reads correctly in RTL: the user's
 * turn stays on the reading-end side without a second implementation.
 */
export const RightToLeft: Story = {
  args: { author: "assistant", children: "" },
  render: () => (
    <div dir="rtl" className="flex w-full max-w-md flex-col gap-2">
      <QPMessageBubble author="user" authorLabels={{ user: "أنت" }}>
        من يملك رموز التصميم؟
      </QPMessageBubble>
      <QPMessageBubble author="assistant" authorLabels={{ assistant: "المساعد" }}>
        حزمة الرموز.
      </QPMessageBubble>
    </div>
  ),
};

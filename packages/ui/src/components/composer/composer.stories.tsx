import type { Meta, StoryObj } from "@storybook/react-vite";
import { Paperclip, SendHorizontal } from "lucide-react";

import { QPIconButton } from "../icon-button";
import { QPComposer } from "./composer";

const meta = {
  title: "Components/QPComposer",
  component: QPComposer,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    submitLabel: { control: "text" },
    placeholder: { control: "text" },
    hint: { control: "text" },
    error: { control: "text" },
    labelVisible: { control: "boolean" },
    disabled: { control: "boolean" },
    busy: { control: "boolean" },
    submitOnEnter: { control: "boolean" },
    rows: { control: { type: "number", min: 1, max: 10 } },
    size: { control: "select", options: ["default", "sm"] },
  },
} satisfies Meta<typeof QPComposer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Message",
    submitLabel: "Send",
    placeholder: "Ask about the codebase…",
    className: "max-w-xl",
  },
};

export const WithVisibleLabel: Story = {
  args: {
    label: "Message",
    labelVisible: true,
    submitLabel: "Send",
    className: "max-w-xl",
  },
};

export const WithHint: Story = {
  args: {
    label: "Message",
    submitLabel: "Send",
    hint: "Enter sends · Shift+Enter adds a line",
    className: "max-w-xl",
  },
};

/** The error replaces the hint as the field's description, so AT reads one message. */
export const WithError: Story = {
  args: {
    label: "Message",
    submitLabel: "Send",
    defaultValue: "…",
    hint: "Enter sends · Shift+Enter adds a line",
    error: "Message exceeds 4,000 characters",
    className: "max-w-xl",
  },
};

export const WithToolbar: Story = {
  args: {
    label: "Message",
    submitLabel: "Send",
    submitContent: <SendHorizontal />,
    defaultValue: "Ready to send",
    toolbar: (
      <QPIconButton label="Attach a file" variant="ghost" size="sm">
        <Paperclip />
      </QPIconButton>
    ),
    className: "max-w-xl",
  },
};

/** A send is in flight: text stays readable, submitting is blocked. */
export const Busy: Story = {
  args: {
    label: "Message",
    submitLabel: "Send",
    defaultValue: "Indexing the repository…",
    busy: true,
    className: "max-w-xl",
  },
};

export const Disabled: Story = {
  args: {
    label: "Message",
    submitLabel: "Send",
    disabled: true,
    className: "max-w-xl",
  },
};

export const Compact: Story = {
  args: {
    label: "Message",
    submitLabel: "Send",
    size: "sm",
    rows: 1,
    className: "max-w-md",
  },
};

export const RightToLeft: Story = {
  args: {
    label: "الرسالة",
    submitLabel: "إرسال",
    placeholder: "اسأل عن الشيفرة…",
    hint: "اضغط Enter للإرسال",
    className: "max-w-xl",
  },
  render: (args) => (
    <div dir="rtl">
      <QPComposer {...args} />
    </div>
  ),
};

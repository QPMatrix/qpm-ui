import type { Meta, StoryObj } from "@storybook/react-vite";

import { QPSecretInput } from "./secret-input";

const meta = {
  title: "Components/QPSecretInput",
  component: QPSecretInput,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    disabled: { control: "boolean" },
    hint: { control: "text" },
    error: { control: "text" },
  },
} satisfies Meta<typeof QPSecretInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "API key", defaultValue: "sk-live-51H9x2KJ8..." },
};

/** Press the eye icon — visibility toggles, focus stays on the toggle. */
export const WithHint: Story = {
  args: {
    label: "Webhook secret",
    defaultValue: "whsec_a1b2c3",
    hint: "Used to verify incoming webhook signatures.",
  },
};

export const WithError: Story = {
  args: {
    label: "Personal access token",
    defaultValue: "",
    error: "A token is required to continue.",
  },
};

export const Disabled: Story = {
  args: { label: "API key", defaultValue: "sk-live-51H9x2KJ8...", disabled: true },
};

/** Every string is a prop — an RTL locale needs no component change. */
export const RightToLeft: Story = {
  args: {
    label: "مفتاح API",
    defaultValue: "sk-live-51H9x2KJ8...",
    showLabel: "إظهار",
    hideLabel: "إخفاء",
    hint: "يُستخدم للمصادقة مع الخدمة.",
  },
};

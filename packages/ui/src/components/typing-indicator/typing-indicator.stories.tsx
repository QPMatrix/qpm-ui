import type { Meta, StoryObj } from "@storybook/react-vite";

import { QPTypingIndicator } from "./typing-indicator";

const meta = {
  title: "Components/QPTypingIndicator",
  component: QPTypingIndicator,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    dotCount: { control: { type: "number", min: 0, max: 6 } },
    size: { control: "select", options: ["default", "sm"] },
  },
} satisfies Meta<typeof QPTypingIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: { size: "sm" },
};

export const MoreDots: Story = {
  args: { dotCount: 5 },
};

/**
 * The label is what a screen-reader user actually receives — the dots are
 * `aria-hidden`. Translate it for localised apps.
 */
export const LocalisedLabel: Story = {
  args: { label: "المساعد يكتب" },
  render: (args) => (
    <div dir="rtl">
      <QPTypingIndicator {...args} />
    </div>
  ),
};

/**
 * Reduced motion: turn on "Emulate CSS prefers-reduced-motion: reduce" in your
 * browser's rendering panel and the dots go static. Nothing is lost — the
 * polite live region carries the state either way.
 */
export const ReducedMotion: Story = {};

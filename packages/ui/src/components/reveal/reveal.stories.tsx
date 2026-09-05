import type { Meta, StoryObj } from "@storybook/react-vite";

import { QPHeading } from "../heading";
import { QPText } from "../text";
import { QPReveal } from "./reveal";

const meta = {
  title: "Motion/QPReveal",
  component: QPReveal,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["reveal", "rise", "fade", "pop", "slideStart", "slideEnd"],
    },
    amount: { control: { type: "number", min: 0, max: 1, step: 0.1 } },
    repeat: { control: "boolean" },
    duration: { control: "select", options: ["fast", "standard", "slow"] },
  },
} satisfies Meta<typeof QPReveal>;

export default meta;
type Story = StoryObj<typeof meta>;

const block = (label: string) => (
  <div className="rounded-xl bg-surface-secondary p-8">
    <QPHeading level={3}>{label}</QPHeading>
    <QPText tone="muted" className="mt-1">
      Arrived as you reached it.
    </QPText>
  </div>
);

/** Scroll the preview down — each block plays as you reach it, once. */
export const Default: Story = {
  args: { children: block("Revealed") },
  render: (args) => (
    <div className="flex flex-col gap-[60vh]">
      <QPText tone="muted">Scroll down ↓</QPText>
      <QPReveal {...args} />
      <QPReveal {...args}>{block("And again")}</QPReveal>
    </div>
  ),
};

/** `repeat` replays on every re-entry. Off by default, and usually the wrong call. */
export const Repeating: Story = {
  args: { repeat: true, children: block("Replays every time") },
  render: (args) => (
    <div className="flex flex-col gap-[60vh]">
      <QPText tone="muted">Scroll down, then back up ↓</QPText>
      <QPReveal {...args} />
    </div>
  ),
};

/** A higher threshold waits until most of the block is on screen. */
export const LateThreshold: Story = {
  args: { amount: 0.8, children: block("Waits for 80%") },
  render: (args) => (
    <div className="flex flex-col gap-[60vh]">
      <QPText tone="muted">Scroll down ↓</QPText>
      <QPReveal {...args} />
    </div>
  ),
};

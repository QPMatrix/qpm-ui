import type { Meta, StoryObj } from "@storybook/react-vite";

import { QPIconButton } from "../icon-button";
import { QPText } from "../text";
import { QPSection } from "./section";

const meta = {
  title: "Layout/QPSection",
  component: QPSection,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    heading: { control: "text" },
    level: { control: "select", options: [1, 2, 3, 4, 5, 6] },
    label: { control: "text" },
    description: { control: "text" },
    eyebrow: { control: "text" },
    spacing: { control: "select", options: ["none", "compact", "default", "spacious"] },
    surface: { control: "select", options: ["none", "subtle", "raised", "brand"] },
    align: { control: "select", options: ["start", "center"] },
    reveal: { control: "boolean" },
  },
} satisfies Meta<typeof QPSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const body = <QPText tone="secondary">Section content goes here.</QPText>;

export const Default: Story = {
  args: { heading: "Recent runs", level: 2, description: "Last 24 hours", children: body },
};

export const WithEyebrowAndAction: Story = {
  args: {
    eyebrow: "Activity",
    heading: "Recent runs",
    level: 2,
    description: "Everything that ran in the last 24 hours.",
    action: (
      <QPIconButton label="Filter runs" variant="ghost" size="sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M4 6h16M7 12h10M10 18h4" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </QPIconButton>
    ),
    children: body,
  },
};

export const Centred: Story = {
  args: {
    heading: "One system, every surface",
    level: 2,
    description: "The same components across the assistant, the dashboard and the docs.",
    align: "center",
    children: body,
  },
};

export const Surfaces: Story = {
  args: { heading: "", level: 2, children: null },
  render: () => (
    <div className="flex flex-col gap-4">
      {(["none", "subtle", "raised", "brand"] as const).map((surface) => (
        <QPSection
          key={surface}
          heading={surface}
          level={2}
          surface={surface}
          spacing="compact"
          className="rounded-xl px-6"
        >
          {body}
        </QPSection>
      ))}
    </div>
  ),
};

/**
 * Arrives as the reader scrolls to it. Scroll the preview to see it play —
 * and turn on "Emulate prefers-reduced-motion" to watch the movement drop out
 * while the content still appears.
 */
export const Revealed: Story = {
  args: {
    heading: "Revealed on scroll",
    level: 2,
    description: "This is what makes a long page feel alive rather than pre-assembled.",
    reveal: true,
    children: body,
  },
  render: (args) => (
    <div className="flex flex-col">
      <div className="h-[70vh] grid place-items-center">
        <QPText tone="muted">Scroll down ↓</QPText>
      </div>
      <QPSection {...args} />
    </div>
  ),
};

/**
 * No heading and no label: the component deliberately renders a plain div
 * rather than an unnamed `<section>`, which screen readers expose as an
 * anonymous group.
 */
export const Unnamed: Story = {
  args: { children: body },
};

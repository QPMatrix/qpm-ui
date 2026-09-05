import type { Meta, StoryObj } from "@storybook/react-vite";

import { QPStatusIndicator } from "./status-indicator";
import type { QPStatusIndicatorStatus } from "./status-indicator.types";

const STATUSES: QPStatusIndicatorStatus[] = [
  "success",
  "warning",
  "error",
  "info",
  "offline",
  "live",
  "connected",
  "processing",
];

const meta = {
  title: "Components/QPStatusIndicator",
  component: QPStatusIndicator,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    status: { control: "select", options: STATUSES },
    size: { control: "select", options: ["sm", "md", "lg"] },
    labelHidden: { control: "boolean" },
    pulse: { control: "boolean" },
    live: { control: "boolean" },
    children: { control: "text" },
  },
} satisfies Meta<typeof QPStatusIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: "success",
    children: "Operational",
  },
};

/** Every status role side by side. Each one carries its own text — never colour alone. */
export const AllStatuses: Story = {
  args: { status: "success", children: "Operational" },
  render: () => (
    <div className="flex flex-col gap-2">
      {STATUSES.map((status) => (
        <QPStatusIndicator key={status} status={status}>
          {status}
        </QPStatusIndicator>
      ))}
    </div>
  ),
};

export const Pulsing: Story = {
  args: {
    status: "live",
    pulse: true,
    children: "Live",
  },
};

/** Live region: announces politely when the status text changes. */
export const Announced: Story = {
  args: {
    status: "processing",
    live: true,
    pulse: true,
    children: "Indexing repositories",
  },
};

/**
 * Dense tables where a column header already names the concept. The label is
 * still in the accessibility tree — it is clipped, not removed.
 */
export const LabelHidden: Story = {
  args: {
    status: "error",
    label: "Build failed",
    labelHidden: true,
  },
};

export const Sizes: Story = {
  args: { status: "connected", children: "Connected" },
  render: () => (
    <div className="flex items-center gap-6">
      <QPStatusIndicator status="connected" size="sm">
        Small
      </QPStatusIndicator>
      <QPStatusIndicator status="connected" size="md">
        Medium
      </QPStatusIndicator>
      <QPStatusIndicator status="connected" size="lg">
        Large
      </QPStatusIndicator>
    </div>
  ),
};

/** Copy is a prop, so RTL locales need no separate component. */
export const RightToLeft: Story = {
  args: {
    status: "connected",
    children: "متصل",
  },
  render: (args) => (
    <div dir="rtl">
      <QPStatusIndicator {...args} />
    </div>
  ),
};

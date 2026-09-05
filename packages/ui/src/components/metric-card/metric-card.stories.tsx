import type { Meta, StoryObj } from "@storybook/react-vite";
import { Activity, MoreHorizontal, Users } from "lucide-react";

import { QPIconButton } from "../icon-button";
import { QPMetricCard } from "./metric-card";

const meta = {
  title: "Components/QPMetricCard",
  component: QPMetricCard,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    value: { control: "text" },
    description: { control: "text" },
    loading: { control: "boolean" },
    loadingLabel: { control: "text" },
    align: { control: "select", options: ["start", "center"] },
    size: { control: "select", options: ["default", "sm"] },
  },
} satisfies Meta<typeof QPMetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Active sessions",
    value: "1,284",
    className: "w-64",
  },
};

export const WithTrendUp: Story = {
  args: {
    label: "Requests",
    value: "4.2M",
    icon: <Activity />,
    trend: { direction: "up", value: "+12.4%", label: "up 12.4 percent versus last week" },
    description: "Rolling 7-day window",
    className: "w-64",
  },
};

export const WithTrendDown: Story = {
  args: {
    label: "Error budget",
    value: "38%",
    trend: { direction: "down", value: "-6pt", label: "down 6 points versus last week" },
    className: "w-64",
  },
};

export const Flat: Story = {
  args: {
    label: "Queue depth",
    value: "0",
    trend: { direction: "flat", value: "0", label: "unchanged versus last week" },
    className: "w-64",
  },
};

export const WithAction: Story = {
  args: {
    label: "Team members",
    value: "42",
    icon: <Users />,
    action: (
      <QPIconButton label="Metric options" variant="ghost" size="sm">
        <MoreHorizontal />
      </QPIconButton>
    ),
    className: "w-64",
  },
};

export const Loading: Story = {
  args: {
    label: "Requests",
    value: "4.2M",
    trend: { direction: "up", value: "+12.4%", label: "up 12.4 percent versus last week" },
    loading: true,
    className: "w-64",
  },
};

export const Compact: Story = {
  args: {
    label: "Uptime",
    value: "99.98%",
    size: "sm",
    className: "w-52",
  },
};

/** Copy and number formatting are the caller's; the component stays locale-agnostic. */
export const RightToLeft: Story = {
  args: {
    label: "الجلسات النشطة",
    value: "١٢٨٤",
    description: "آخر ٧ أيام",
    className: "w-64",
  },
  render: (args) => (
    <div dir="rtl">
      <QPMetricCard {...args} />
    </div>
  ),
};

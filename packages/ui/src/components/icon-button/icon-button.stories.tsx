import type { Meta, StoryObj } from "@storybook/react-vite";
import { Check, Plus, Trash2, X } from "lucide-react";

import { QPIconButton } from "./icon-button";

const meta = {
  title: "Components/QPIconButton",
  component: QPIconButton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: {
      control: "select",
      options: ["default", "outline", "secondary", "ghost", "destructive", "link"],
    },
    disabled: { control: "boolean" },
    nativeButton: { control: "boolean" },
  },
} satisfies Meta<typeof QPIconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Add item",
    children: <Plus />,
  },
};

export const Small: Story = {
  args: {
    label: "Add item",
    size: "sm",
    children: <Plus />,
  },
};

export const Large: Story = {
  args: {
    label: "Add item",
    size: "lg",
    children: <Plus />,
  },
};

export const Outline: Story = {
  args: {
    label: "Confirm",
    variant: "outline",
    children: <Check />,
  },
};

export const Ghost: Story = {
  args: {
    label: "Dismiss",
    variant: "ghost",
    children: <X />,
  },
};

export const Destructive: Story = {
  args: {
    label: "Delete permanently",
    variant: "destructive",
    children: <Trash2 />,
  },
};

export const Disabled: Story = {
  args: {
    label: "Delete permanently",
    variant: "destructive",
    disabled: true,
    children: <Trash2 />,
  },
};

/** RTL locales get the same component — the label is a prop, so nothing is baked in. */
export const RightToLeftLabel: Story = {
  args: {
    label: "إغلاق",
    variant: "ghost",
    children: <X />,
  },
};

/** Composition: renders as an anchor via the primitive's `render` prop. */
export const AsLink: Story = {
  args: {
    label: "Open documentation",
    render: <a href="#docs" />,
    nativeButton: false,
    children: <Check />,
  },
};

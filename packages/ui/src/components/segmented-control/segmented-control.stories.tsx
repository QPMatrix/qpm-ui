import type { Meta, StoryObj } from "@storybook/react-vite";

import { QPSegmentedControl } from "./segmented-control";

const meta = {
  title: "Components/QPSegmentedControl",
  component: QPSegmentedControl,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["default", "outline"] },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    disabled: { control: "boolean" },
    loopFocus: { control: "boolean" },
    value: { control: "text" },
    defaultValue: { control: "text" },
    segmentWidth: { control: "inline-radio", options: ["auto", "equal"] },
  },
} satisfies Meta<typeof QPSegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

const rangeItems = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

export const Default: Story = {
  args: {
    "aria-label": "Reporting range",
    items: rangeItems,
    defaultValue: "week",
  },
};

export const Small: Story = {
  args: {
    "aria-label": "Reporting range",
    items: rangeItems,
    defaultValue: "week",
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    "aria-label": "Reporting range",
    items: rangeItems,
    defaultValue: "week",
    size: "lg",
  },
};

export const Outline: Story = {
  args: {
    "aria-label": "Reporting range",
    items: rangeItems,
    defaultValue: "day",
    variant: "outline",
  },
};

export const WithDisabledSegment: Story = {
  args: {
    "aria-label": "Reporting range",
    items: [...rangeItems, { value: "year", label: "Year", disabled: true }],
    defaultValue: "day",
  },
};

export const AllDisabled: Story = {
  args: {
    "aria-label": "Reporting range",
    items: rangeItems,
    defaultValue: "day",
    disabled: true,
  },
};

export const Vertical: Story = {
  args: {
    "aria-label": "Reporting range",
    items: rangeItems,
    defaultValue: "month",
    orientation: "vertical",
  },
};

const unequalLabelItems = [
  { value: "chat", label: "Chat" },
  { value: "status", label: "Status" },
  { value: "activity", label: "Live Team Activity" },
  { value: "approvals", label: "Approval Inbox" },
];

/**
 * `segmentWidth` defaults to `"auto"`, so unequal labels are never forced
 * into the same width — each segment sizes to its own content. This is the
 * fix for QPMSEC-787: with the pre-existing `"equal"` behaviour, a six-tab
 * strip running "Chat" through "Live Team Activity" gave every tab the same
 * one-sixth share, and the longer labels printed on top of their neighbours.
 */
export const UnequalLabels: Story = {
  args: {
    "aria-label": "Section",
    items: unequalLabelItems,
    defaultValue: "chat",
  },
};

/**
 * `segmentWidth="equal"` restores the original forced equal-share track —
 * compare against `UnequalLabels` above: the same items, only the width
 * strategy differs, and here the longest label spills past its segment.
 */
export const UnequalLabelsEqualWidth: Story = {
  args: {
    "aria-label": "Section",
    items: unequalLabelItems,
    defaultValue: "chat",
    segmentWidth: "equal",
  },
};

/** Every string is data: an RTL locale needs no component change. */
export const RightToLeft: Story = {
  args: {
    "aria-label": "טווח דיווח",
    items: [
      { value: "day", label: "יום" },
      { value: "week", label: "שבוע" },
      { value: "month", label: "חודש" },
    ],
    defaultValue: "week",
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";

import { QPText } from "../text";
import { QPHeading } from "./heading";

const meta = {
  title: "Typography/QPHeading",
  component: QPHeading,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    level: { control: "select", options: [1, 2, 3, 4, 5, 6] },
    variant: {
      control: "select",
      options: ["display-lg", "display-md", "h1", "h2", "h3", "h4", "body-lg", "label"],
    },
    tone: { control: "select", options: ["primary", "secondary", "muted", "brand"] },
    plain: { control: "boolean" },
    align: { control: "select", options: ["start", "center", "end"] },
    children: { control: "text" },
  },
} satisfies Meta<typeof QPHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { level: 2, children: "Recent runs" },
};

/** Levels 1–6, each rendering its own heading element. */
export const Levels: Story = {
  args: { level: 1, children: "" },
  render: () => (
    <div className="flex flex-col gap-3">
      {([1, 2, 3, 4, 5, 6] as const).map((level) => (
        <QPHeading key={level} level={level}>
          {`Heading level ${String(level)}`}
        </QPHeading>
      ))}
    </div>
  ),
};

/**
 * Outline level and visual weight are separate props. Here the heading is
 * outline-level 3 — correct for its position in the document — while looking
 * like a display heading because it opens the page.
 */
export const LevelVersusLook: Story = {
  args: { level: 3, variant: "display-md", children: "Pipelines" },
};

/**
 * `plain` keeps the type style but emits a `<span>`, so a grid of a hundred
 * cards does not flood the document outline with a hundred headings.
 */
export const Plain: Story = {
  args: { level: 3, plain: true, children: "Build #4102" },
};

/** A realistic page fragment: one h1, sections at h2, subsections at h3. */
export const InContext: Story = {
  args: { level: 1, children: "" },
  render: () => (
    <div className="flex max-w-xl flex-col gap-4">
      <QPHeading level={1} variant="display-md">
        Pipelines
      </QPHeading>
      <QPText tone="muted">Everything running across the QPMatrix estate.</QPText>
      <QPHeading level={2}>Recent runs</QPHeading>
      <QPText tone="secondary">The last 24 hours of activity.</QPText>
      <QPHeading level={3}>Failed</QPHeading>
      <QPText tone="secondary">Three runs need attention.</QPText>
    </div>
  ),
};

export const RightToLeft: Story = {
  args: { level: 2, children: "عمليات التشغيل" },
  render: (args) => (
    <div dir="rtl">
      <QPHeading {...args} />
    </div>
  ),
};

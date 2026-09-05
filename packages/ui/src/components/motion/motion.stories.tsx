import type { Meta, StoryObj } from "@storybook/react-vite";

import { QP_VARIANTS } from "../../lib/motion/motion-core.constants";
import { QPHeading } from "../heading";
import { QPText } from "../text";
import { QPMotion } from "./motion";

const VARIANTS = Object.keys(QP_VARIANTS) as (keyof typeof QP_VARIANTS)[];

const meta = {
  title: "Motion/QPMotion",
  component: QPMotion,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: VARIANTS },
    as: { control: "select", options: ["div", "section", "article", "li", "p"] },
    duration: {
      control: "select",
      options: ["instant", "fast", "standard", "slow", "ambient", "flow"],
    },
    ease: { control: "select", options: ["standard", "out", "in", "inOut"] },
    delay: { control: { type: "number", step: 0.05 } },
  },
} satisfies Meta<typeof QPMotion>;

export default meta;
type Story = StoryObj<typeof meta>;

const card = (
  <div className="rounded-xl bg-surface-secondary p-6 shadow-elevation-raised">
    <QPHeading level={3}>Pipelines</QPHeading>
    <QPText tone="muted" className="mt-1">
      4,102 runs this week
    </QPText>
  </div>
);

export const Default: Story = {
  args: { children: card },
};

/**
 * Every named motion in the system. Reload the story to replay them.
 *
 * Turn on "Emulate CSS prefers-reduced-motion: reduce" in your browser's
 * rendering panel: the movement disappears and only the cross-fade remains —
 * no content is lost, which is the whole design.
 */
export const AllVariants: Story = {
  args: { children: null },
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      {VARIANTS.map((variant) => (
        <QPMotion key={variant} variant={variant}>
          <div className="rounded-lg bg-surface-secondary px-4 py-3">
            <QPText variant="label" as="span">
              {variant}
            </QPText>
          </div>
        </QPMotion>
      ))}
    </div>
  ),
};

export const Slow: Story = {
  args: { duration: "slow", children: card },
};

export const Delayed: Story = {
  args: { delay: 0.4, children: card },
};

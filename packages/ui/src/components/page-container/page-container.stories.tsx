import type { Meta, StoryObj } from "@storybook/react-vite";

import { QPHeading } from "../heading";
import { QPText } from "../text";
import { QPPageContainer } from "./page-container";

const meta = {
  title: "Layout/QPPageContainer",
  component: QPPageContainer,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  argTypes: {
    width: { control: "select", options: ["prose", "content", "wide", "full"] },
    padding: { control: "select", options: ["none", "compact", "default", "spacious"] },
    as: { control: "select", options: ["div", "main", "section", "article"] },
    animate: { control: "boolean" },
  },
} satisfies Meta<typeof QPPageContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const sample = (
  <>
    <QPHeading level={1} variant="display-md">
      Pipelines
    </QPHeading>
    <QPText tone="muted" className="mt-2">
      Everything running across the QPMatrix estate.
    </QPText>
  </>
);

export const Default: Story = {
  args: { as: "main", children: sample },
};

/** Long-form reading, capped near 68 characters per line. */
export const Prose: Story = {
  args: {
    width: "prose",
    children: (
      <>
        <QPHeading level={1}>Why measure matters</QPHeading>
        <QPText className="mt-4" tone="secondary">
          Line length, not screen width, is what makes long text readable. A paragraph spanning a
          27-inch monitor loses the reader on every line return, which is why this container caps at
          roughly 68 characters rather than at a pixel figure.
        </QPText>
      </>
    ),
  },
};

/** Dashboards, where a wide grid needs the room. */
export const Wide: Story = {
  args: { width: "wide", children: sample },
};

/** `full` opts out of the measure entirely for split views and app shells. */
export const Full: Story = {
  args: { width: "full", children: sample },
};

export const Spacious: Story = {
  args: { padding: "spacious", children: sample },
};

/** Animates its content in on mount. Degrades to a cross-fade under reduced motion. */
export const Animated: Story = {
  args: { animate: true, children: sample },
};

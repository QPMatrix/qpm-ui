import type { Meta, StoryObj } from "@storybook/react-vite";

import { Progress } from "./progress";

/**
 * Progress — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered here against the real `styles/qpmatrix.css`, so what you see is
 * what an app gets: same tokens, same cascade, same dark/light switch. The
 * a11y panel runs axe on every story.
 */
const meta = {
  title: "Primitives/Feedback/Progress",
  component: Progress,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: 62 },
  render: () => (
    <>
      <Progress value={62} className="w-64" aria-label="Upload progress" />
    </>
  ),
};

export const Values: Story = {
  args: { value: 62 },
  render: () => (
    <div className="flex w-64 flex-col gap-3">
      {[0, 38, 62, 100].map((value) => (
        <Progress key={value} value={value} aria-label={`Progress ${String(value)} percent`} />
      ))}
    </div>
  ),
};

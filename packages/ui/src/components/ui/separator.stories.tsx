import type { Meta, StoryObj } from "@storybook/react-vite";

import { Separator } from "./separator";

/**
 * Separator — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered here against the real `styles/qpmatrix.css`, so what you see is
 * what an app gets: same tokens, same cascade, same dark/light switch. The
 * a11y panel runs axe on every story.
 */
const meta = {
  title: "Primitives/Layout/Separator",
  component: Separator,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <div className="w-64">
        <Separator />
      </div>
    </>
  ),
};

export const Orientations: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="w-64">
        <Separator />
      </div>
      <div className="flex h-16 items-center gap-4">
        <span className="text-body-sm">Left</span>
        <Separator orientation="vertical" />
        <span className="text-body-sm">Right</span>
      </div>
    </div>
  ),
};

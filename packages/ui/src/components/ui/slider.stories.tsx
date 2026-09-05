import type { Meta, StoryObj } from "@storybook/react-vite";

import { Slider } from "./slider";

/**
 * Slider — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered here against the real `styles/qpmatrix.css`, so what you see is
 * what an app gets: same tokens, same cascade, same dark/light switch. The
 * a11y panel runs axe on every story.
 */
const meta = {
  title: "Primitives/Forms/Slider",
  component: Slider,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <Slider defaultValue={[40]} className="w-64" aria-label="Threshold" />
    </>
  ),
};

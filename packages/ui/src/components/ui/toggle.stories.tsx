import type { Meta, StoryObj } from "@storybook/react-vite";

import { Toggle } from "./toggle";

/**
 * Toggle — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered here against the real `styles/qpmatrix.css`, so what you see is
 * what an app gets: same tokens, same cascade, same dark/light switch. The
 * a11y panel runs axe on every story.
 */
const meta = {
  title: "Primitives/Actions/Toggle",
  component: Toggle,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <Toggle aria-label="Bold">B</Toggle>
    </>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Toggle aria-label="Bold">B</Toggle>
      <Toggle variant="outline" aria-label="Italic">
        I
      </Toggle>
      <Toggle defaultPressed aria-label="Underline">
        U
      </Toggle>
      <Toggle disabled aria-label="Strikethrough">
        S
      </Toggle>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Toggle size="sm" aria-label="Small">
        sm
      </Toggle>
      <Toggle aria-label="Default">default</Toggle>
      <Toggle size="lg" aria-label="Large">
        lg
      </Toggle>
    </div>
  ),
};

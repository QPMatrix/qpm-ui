import type { Meta, StoryObj } from "@storybook/react-vite";

import { Kbd } from "./kbd";

/**
 * Kbd — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered here against the real `styles/qpmatrix.css`, so what you see is
 * what an app gets: same tokens, same cascade, same dark/light switch. The
 * a11y panel runs axe on every story.
 */
const meta = {
  title: "Primitives/Data/Kbd",
  component: Kbd,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <Kbd>⌘K</Kbd>
    </>
  ),
};

export const Combinations: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Kbd>⌘K</Kbd>
      <Kbd>⇧</Kbd>
      <Kbd>Esc</Kbd>
      <Kbd>Enter</Kbd>
    </div>
  ),
};

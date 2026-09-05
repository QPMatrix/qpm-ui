import type { Meta, StoryObj } from "@storybook/react-vite";

import { Textarea } from "./textarea";

/**
 * Textarea — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered here against the real `styles/qpmatrix.css`, so what you see is
 * what an app gets: same tokens, same cascade, same dark/light switch. The
 * a11y panel runs axe on every story.
 */
const meta = {
  title: "Primitives/Forms/Textarea",
  component: Textarea,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <Textarea placeholder="Notes" aria-label="Notes" className="w-64" />
    </>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-3">
      <Textarea placeholder="Default" aria-label="Default" />
      <Textarea defaultValue="With a value" aria-label="Filled" />
      <Textarea placeholder="Invalid" aria-label="Invalid" aria-invalid />
      <Textarea placeholder="Disabled" aria-label="Disabled" disabled />
    </div>
  ),
};

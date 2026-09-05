import type { Meta, StoryObj } from "@storybook/react-vite";

import { Checkbox } from "./checkbox";

/**
 * Checkbox — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered here against the real `styles/qpmatrix.css`, so what you see is
 * what an app gets: same tokens, same cascade, same dark/light switch. The
 * a11y panel runs axe on every story.
 */
const meta = {
  title: "Primitives/Forms/Checkbox",
  component: Checkbox,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <Checkbox aria-label="Select run" />
    </>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Checkbox aria-label="Unchecked" />
      <Checkbox defaultChecked aria-label="Checked" />
      <Checkbox indeterminate aria-label="Indeterminate" />
      <Checkbox disabled aria-label="Disabled" />
      <Checkbox defaultChecked disabled aria-label="Checked and disabled" />
    </div>
  ),
};

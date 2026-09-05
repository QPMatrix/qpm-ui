import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "./input";

/**
 * Input — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered here against the real `styles/qpmatrix.css`, so what you see is
 * what an app gets: same tokens, same cascade, same dark/light switch. The
 * a11y panel runs axe on every story.
 */
const meta = {
  title: "Primitives/Forms/Input",
  component: Input,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <Input placeholder="Search runs" aria-label="Search runs" className="w-64" />
    </>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-3">
      <Input placeholder="Default" aria-label="Default" />
      <Input defaultValue="With a value" aria-label="Filled" />
      <Input placeholder="Invalid" aria-label="Invalid" aria-invalid />
      <Input placeholder="Disabled" aria-label="Disabled" disabled />
      <Input type="password" defaultValue="secret" aria-label="Password" />
    </div>
  ),
};

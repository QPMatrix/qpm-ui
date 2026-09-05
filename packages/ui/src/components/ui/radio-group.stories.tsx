import type { Meta, StoryObj } from "@storybook/react-vite";

import { RadioGroup, RadioGroupItem } from "./radio-group";

/**
 * RadioGroup — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered here against the real `styles/qpmatrix.css`, so what you see is
 * what an app gets: same tokens, same cascade, same dark/light switch. The
 * a11y panel runs axe on every story.
 */
const meta = {
  title: "Primitives/Forms/RadioGroup",
  component: RadioGroup,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <RadioGroup defaultValue="all" aria-label="Filter">
        <label className="flex items-center gap-2">
          <RadioGroupItem value="all" /> All
        </label>
        <label className="flex items-center gap-2">
          <RadioGroupItem value="failed" /> Failed
        </label>
      </RadioGroup>
    </>
  ),
};

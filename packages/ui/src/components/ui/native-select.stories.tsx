import type { Meta, StoryObj } from "@storybook/react-vite";

import { NativeSelect } from "./native-select";

/**
 * NativeSelect — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered here against the real `styles/qpmatrix.css`, so what you see is
 * what an app gets: same tokens, same cascade, same dark/light switch. The
 * a11y panel runs axe on every story.
 */
const meta = {
  title: "Primitives/Forms/NativeSelect",
  component: NativeSelect,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof NativeSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <NativeSelect aria-label="Range" className="w-48">
        <option value="day">Day</option>
        <option value="week">Week</option>
      </NativeSelect>
    </>
  ),
};

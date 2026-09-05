import type { Meta, StoryObj } from "@storybook/react-vite";

import { ScrollArea } from "./scroll-area";

/**
 * ScrollArea — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered here against the real `styles/qpmatrix.css`, so what you see is
 * what an app gets: same tokens, same cascade, same dark/light switch. The
 * a11y panel runs axe on every story.
 */
const meta = {
  title: "Primitives/Layout/ScrollArea",
  component: ScrollArea,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <ScrollArea className="h-40 w-64 rounded-lg border border-border-subtle p-3">
        {Array.from({ length: 20 }, (_unused, index) => (
          <p key={index} className="py-1 text-body-sm">
            Run #{4102 - index}
          </p>
        ))}
      </ScrollArea>
    </>
  ),
};

import type { Meta, StoryObj } from "@storybook/react-vite";

import { BubbleGroup, Bubble, BubbleContent } from "./bubble";

/**
 * Bubble — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered against the real `styles/qpmatrix.css`, so what you see is what an
 * app gets: same tokens, same cascade, same dark/light switch. The a11y panel
 * runs axe on every story.
 */
const meta = {
  title: "Primitives/Chat/Bubble",
  component: BubbleGroup,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof BubbleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <BubbleGroup className="w-80">
        <Bubble>
          <BubbleContent>Which package owns the design tokens?</BubbleContent>
        </Bubble>
        <Bubble>
          <BubbleContent>
            @qpmatrix/tokens — the UI kit consumes them through the adapter.
          </BubbleContent>
        </Bubble>
      </BubbleGroup>
    </>
  ),
};

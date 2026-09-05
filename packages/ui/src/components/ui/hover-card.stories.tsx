import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "./hover-card";

/**
 * HoverCard — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered here against the real `styles/qpmatrix.css`, so what you see is
 * what an app gets: same tokens, same cascade, same dark/light switch. The
 * a11y panel runs axe on every story.
 */
const meta = {
  title: "Primitives/Overlay/HoverCard",
  component: HoverCard,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <HoverCard>
        <HoverCardTrigger render={<Button variant="link">QPMatrix</Button>} />
        <HoverCardContent>The shared component kit.</HoverCardContent>
      </HoverCard>
    </>
  ),
};

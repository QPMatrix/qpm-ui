import type { Meta, StoryObj } from "@storybook/react-vite";

import { Avatar, AvatarFallback } from "./avatar";

/**
 * Avatar — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered here against the real `styles/qpmatrix.css`, so what you see is
 * what an app gets: same tokens, same cascade, same dark/light switch. The
 * a11y panel runs axe on every story.
 */
const meta = {
  title: "Primitives/Data/Avatar",
  component: Avatar,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <Avatar>
        <AvatarFallback>QP</AvatarFallback>
      </Avatar>
    </>
  ),
};

export const Fallbacks: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarFallback>QP</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>HH</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>ع</AvatarFallback>
      </Avatar>
    </div>
  ),
};

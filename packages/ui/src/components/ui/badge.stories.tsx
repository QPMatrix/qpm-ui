import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "./badge";

/**
 * Badge — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered here against the real `styles/qpmatrix.css`, so what you see is
 * what an app gets: same tokens, same cascade, same dark/light switch. The
 * a11y panel runs axe on every story.
 */
const meta = {
  title: "Primitives/Data/Badge",
  component: Badge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <Badge>Live</Badge>
    </>
  ),
};

const BADGE_VARIANTS = ["default", "secondary", "destructive", "outline", "ghost", "link"] as const;

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {BADGE_VARIANTS.map((variant) => (
        <Badge key={variant} variant={variant}>
          {variant}
        </Badge>
      ))}
    </div>
  ),
};

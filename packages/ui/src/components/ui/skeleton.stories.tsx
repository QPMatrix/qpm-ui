import type { Meta, StoryObj } from "@storybook/react-vite";

import { Skeleton } from "./skeleton";

/**
 * Skeleton — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered here against the real `styles/qpmatrix.css`, so what you see is
 * what an app gets: same tokens, same cascade, same dark/light switch. The
 * a11y panel runs axe on every story.
 */
const meta = {
  title: "Primitives/Feedback/Skeleton",
  component: Skeleton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <Skeleton className="h-8 w-48 rounded-md" />
    </>
  ),
};

/** The shape a skeleton takes is the caller's — it ships no dimensions. */
export const Shapes: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-3">
      <Skeleton className="h-8 w-48 rounded-md" />
      <Skeleton className="h-4 w-full rounded-md" />
      <Skeleton className="h-4 w-2/3 rounded-md" />
      <Skeleton className="size-12 rounded-full" />
    </div>
  ),
};

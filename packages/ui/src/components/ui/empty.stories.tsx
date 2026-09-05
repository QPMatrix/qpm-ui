import type { Meta, StoryObj } from "@storybook/react-vite";

import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "./empty";

/**
 * Empty — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered here against the real `styles/qpmatrix.css`, so what you see is
 * what an app gets: same tokens, same cascade, same dark/light switch. The
 * a11y panel runs axe on every story.
 */
const meta = {
  title: "Primitives/Feedback/Empty",
  component: Empty,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <Empty className="w-80">
        <EmptyHeader>
          <EmptyTitle>No runs yet</EmptyTitle>
          <EmptyDescription>Trigger a pipeline to see activity here.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </>
  ),
};

import type { Meta, StoryObj } from "@storybook/react-vite";

import { QPIcon } from "../../lib/icons";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "./empty";

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

/**
 * `EmptyMedia`'s `icon` variant expects an element. `QPIcon` is this
 * package's re-export of `lucide-react` — the same set every shadcn
 * primitive here already depends on — so filling this slot never requires a
 * consuming app to add an icon library of its own (QPMSEC-787).
 */
export const WithIcon: Story = {
  render: () => (
    <Empty className="w-80">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <QPIcon.Inbox aria-hidden />
        </EmptyMedia>
        <EmptyTitle>No runs yet</EmptyTitle>
        <EmptyDescription>Trigger a pipeline to see activity here.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
};

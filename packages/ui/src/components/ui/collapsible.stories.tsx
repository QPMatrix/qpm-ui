import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";

/**
 * Collapsible — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered here against the real `styles/qpmatrix.css`, so what you see is
 * what an app gets: same tokens, same cascade, same dark/light switch. The
 * a11y panel runs axe on every story.
 */
const meta = {
  title: "Primitives/Layout/Collapsible",
  component: Collapsible,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <Collapsible className="w-72">
        <CollapsibleTrigger render={<Button variant="outline">Toggle details</Button>} />
        <CollapsibleContent>Four runs failed in the last hour.</CollapsibleContent>
      </Collapsible>
    </>
  ),
};

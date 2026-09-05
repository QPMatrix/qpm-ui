import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./dropdown-menu";

/**
 * DropdownMenu — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered here against the real `styles/qpmatrix.css`, so what you see is
 * what an app gets: same tokens, same cascade, same dark/light switch. The
 * a11y panel runs axe on every story.
 */
const meta = {
  title: "Primitives/Overlay/DropdownMenu",
  component: DropdownMenu,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline">Actions</Button>} />
        <DropdownMenuContent>
          <DropdownMenuLabel>Run</DropdownMenuLabel>
          <DropdownMenuItem>Re-run</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Cancel</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  ),
};

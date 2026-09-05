import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarShortcut,
} from "./menubar";

/**
 * Menubar — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered against the real `styles/qpmatrix.css`, so what you see is what an
 * app gets: same tokens, same cascade, same dark/light switch. The a11y panel
 * runs axe on every story.
 */
const meta = {
  title: "Primitives/Navigation/Menubar",
  component: Menubar,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Menubar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Run</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              Trigger<MenubarShortcut>⌘T</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>Re-run last</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Cancel all</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Logs</MenubarItem>
            <MenubarItem>Artifacts</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </>
  ),
};

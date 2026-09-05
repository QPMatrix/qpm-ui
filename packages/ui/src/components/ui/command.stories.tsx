import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "./command";

/**
 * Command — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered against the real `styles/qpmatrix.css`, so what you see is what an
 * app gets: same tokens, same cascade, same dark/light switch. The a11y panel
 * runs axe on every story.
 */
const meta = {
  title: "Primitives/Overlay/Command",
  component: Command,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <Command className="w-80 rounded-lg border border-border-subtle">
        <CommandInput placeholder="Search pipelines…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Pipelines">
            <CommandItem>
              build-and-deploy<CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>nightly-index</CommandItem>
            <CommandItem>token-sync</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </>
  ),
};

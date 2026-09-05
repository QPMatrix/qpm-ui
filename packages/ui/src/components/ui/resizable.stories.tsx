import type { Meta, StoryObj } from "@storybook/react-vite";

import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "./resizable";

/**
 * Resizable — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered against the real `styles/qpmatrix.css`, so what you see is what an
 * app gets: same tokens, same cascade, same dark/light switch. The a11y panel
 * runs axe on every story.
 */
const meta = {
  title: "Primitives/Layout/Resizable",
  component: ResizablePanelGroup,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ResizablePanelGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <ResizablePanelGroup className="h-40 w-96 rounded-lg border border-border-subtle">
        <ResizablePanel defaultSize={40}>
          <div className="grid h-full place-items-center text-body-sm">Sidebar</div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60}>
          <div className="grid h-full place-items-center text-body-sm">Content</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  ),
};

import type { Meta, StoryObj } from "@storybook/react-vite";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

/**
 * Tabs — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered here against the real `styles/qpmatrix.css`, so what you see is
 * what an app gets: same tokens, same cascade, same dark/light switch. The
 * a11y panel runs axe on every story.
 */
const meta = {
  title: "Primitives/Navigation/Tabs",
  component: Tabs,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <Tabs defaultValue="runs" className="w-80">
        <TabsList>
          <TabsTrigger value="runs">Runs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="runs">4,102 runs this week.</TabsContent>
        <TabsContent value="settings">Theme and notifications.</TabsContent>
      </Tabs>
    </>
  ),
};

/** The `line` variant, for surfaces where a filled tab list is too heavy. */
export const Line: Story = {
  render: () => (
    <Tabs defaultValue="runs" className="w-80">
      <TabsList variant="line">
        <TabsTrigger value="runs">Runs</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="runs">4,102 runs this week.</TabsContent>
      <TabsContent value="settings">Theme and notifications.</TabsContent>
    </Tabs>
  ),
};

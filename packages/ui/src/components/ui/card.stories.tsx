import type { Meta, StoryObj } from "@storybook/react-vite";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./card";

/**
 * Card — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered here against the real `styles/qpmatrix.css`, so what you see is
 * what an app gets: same tokens, same cascade, same dark/light switch. The
 * a11y panel runs axe on every story.
 */
const meta = {
  title: "Primitives/Data/Card",
  component: Card,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <Card className="w-72">
        <CardHeader>
          <CardTitle>Recent runs</CardTitle>
          <CardDescription>Last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>4,102 runs completed.</CardContent>
      </Card>
    </>
  ),
};

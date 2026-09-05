import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions } from "./item";

/**
 * Item — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered against the real `styles/qpmatrix.css`, so what you see is what an
 * app gets: same tokens, same cascade, same dark/light switch. The a11y panel
 * runs axe on every story.
 */
const meta = {
  title: "Primitives/Data/Item",
  component: Item,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <Item className="w-96">
        <ItemMedia>
          <div className="size-8 rounded-md bg-brand-subtle" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>build-and-deploy</ItemTitle>
          <ItemDescription>Last run 4 minutes ago · 1m 12s</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm">
            Re-run
          </Button>
        </ItemActions>
      </Item>
    </>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-2">
      {(["default", "outline", "muted"] as const).map((variant) => (
        <Item key={variant} variant={variant}>
          <ItemContent>
            <ItemTitle>{variant}</ItemTitle>
            <ItemDescription>Last run 4 minutes ago</ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </div>
  ),
};

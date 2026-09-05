import type { Meta, StoryObj } from "@storybook/react-vite";

import { Marker, MarkerIcon, MarkerContent } from "./marker";

/**
 * Marker — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered against the real `styles/qpmatrix.css`, so what you see is what an
 * app gets: same tokens, same cascade, same dark/light switch. The a11y panel
 * runs axe on every story.
 */
const meta = {
  title: "Primitives/Data/Marker",
  component: Marker,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Marker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <Marker className="w-80">
        <MarkerIcon />
        <MarkerContent>Three runs failed in the last hour.</MarkerContent>
      </Marker>
    </>
  ),
};

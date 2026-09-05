import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "./button-group";

/**
 * ButtonGroup — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered against the real `styles/qpmatrix.css`, so what you see is what an
 * app gets: same tokens, same cascade, same dark/light switch. The a11y panel
 * runs axe on every story.
 */
const meta = {
  title: "Primitives/Actions/ButtonGroup",
  component: ButtonGroup,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <ButtonGroup>
        <Button variant="outline">Day</Button>
        <Button variant="outline">Week</Button>
        <ButtonGroupSeparator />
        <ButtonGroupText>UTC</ButtonGroupText>
      </ButtonGroup>
    </>
  ),
};

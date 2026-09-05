import type { Meta, StoryObj } from "@storybook/react-vite";

import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "./input-group";

/**
 * InputGroup — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered against the real `styles/qpmatrix.css`, so what you see is what an
 * app gets: same tokens, same cascade, same dark/light switch. The a11y panel
 * runs axe on every story.
 */
const meta = {
  title: "Primitives/Forms/InputGroup",
  component: InputGroup,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <InputGroup className="w-80">
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="pipelines.qpmatrix.tech" aria-label="Host" />
      </InputGroup>
    </>
  ),
};

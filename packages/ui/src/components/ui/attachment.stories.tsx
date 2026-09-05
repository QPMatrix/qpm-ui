import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  AttachmentGroup,
  Attachment,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
} from "./attachment";

/**
 * Attachment — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered against the real `styles/qpmatrix.css`, so what you see is what an
 * app gets: same tokens, same cascade, same dark/light switch. The a11y panel
 * runs axe on every story.
 */
const meta = {
  title: "Primitives/Chat/Attachment",
  component: AttachmentGroup,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof AttachmentGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <AttachmentGroup className="w-80">
        <Attachment>
          <AttachmentContent>
            <AttachmentTitle>run-4102.log</AttachmentTitle>
            <AttachmentDescription>412 KB · plain text</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      </AttachmentGroup>
    </>
  ),
};

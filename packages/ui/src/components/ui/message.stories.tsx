import type { Meta, StoryObj } from "@storybook/react-vite";

import { MessageGroup, Message, MessageAvatar, MessageContent, MessageHeader } from "./message";

/**
 * Message — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered against the real `styles/qpmatrix.css`, so what you see is what an
 * app gets: same tokens, same cascade, same dark/light switch. The a11y panel
 * runs axe on every story.
 */
const meta = {
  title: "Primitives/Chat/Message",
  component: MessageGroup,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof MessageGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <MessageGroup className="w-80">
        <Message>
          <MessageAvatar />
          <MessageContent>
            <MessageHeader>Assistant</MessageHeader>I have indexed the repository. Ask me anything
            about it.
          </MessageContent>
        </Message>
      </MessageGroup>
    </>
  ),
};

import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
} from "./message-scroller";

/**
 * MessageScroller — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered against the real `styles/qpmatrix.css`, so what you see is what an
 * app gets: same tokens, same cascade, same dark/light switch. The a11y panel
 * runs axe on every story.
 */
const meta = {
  title: "Primitives/Chat/MessageScroller",
  component: MessageScrollerProvider,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof MessageScrollerProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <MessageScrollerProvider>
        <MessageScroller className="h-48 w-80 rounded-lg border border-border-subtle">
          <MessageScrollerViewport>
            <MessageScrollerContent>
              {Array.from({ length: 12 }, (_unused, index) => (
                <MessageScrollerItem key={index} className="px-3 py-2 text-body-sm">
                  Message {index + 1}
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
        </MessageScroller>
      </MessageScrollerProvider>
    </>
  ),
};

import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import { Toaster, ToastProvider, toast } from "./toast";

/**
 * Toast — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered against the real `styles/qpmatrix.css`, so what you see is what an
 * app gets: same tokens, same cascade, same dark/light switch. The a11y panel
 * runs axe on every story.
 */
const meta = {
  title: "Primitives/Feedback/Toast",
  component: Toaster,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <ToastProvider>
        <Button
          onClick={() => {
            // `toast` is a manager created by Base UI, not a callable.
            toast.add({
              title: "Pipeline queued",
              description: "build-and-deploy will start shortly.",
            });
          }}
        >
          Show a toast
        </Button>
        <Toaster />
      </ToastProvider>
    </>
  ),
};

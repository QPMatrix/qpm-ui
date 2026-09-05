import type { Meta, StoryObj } from "@storybook/react-vite";

import { Alert, AlertTitle, AlertDescription } from "./alert";

/**
 * Alert — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered here against the real `styles/qpmatrix.css`, so what you see is
 * what an app gets: same tokens, same cascade, same dark/light switch. The
 * a11y panel runs axe on every story.
 */
const meta = {
  title: "Primitives/Feedback/Alert",
  component: Alert,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <Alert className="w-96">
        <AlertTitle>Build failed</AlertTitle>
        <AlertDescription>Three runs need attention.</AlertDescription>
      </Alert>
    </>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive" className="w-96">
      <AlertTitle>Deployment failed</AlertTitle>
      <AlertDescription>The build step exited with code 1.</AlertDescription>
    </Alert>
  ),
};

/** Both tones together, so the difference is legible at a glance. */
export const Variants: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-3">
      <Alert>
        <AlertTitle>Indexing complete</AlertTitle>
        <AlertDescription>4,102 files were indexed.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Deployment failed</AlertTitle>
        <AlertDescription>The build step exited with code 1.</AlertDescription>
      </Alert>
    </div>
  ),
};

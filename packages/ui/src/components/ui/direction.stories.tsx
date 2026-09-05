import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import { ButtonGroup } from "./button-group";
import { DirectionProvider } from "./direction";

/**
 * Direction — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered against the real `styles/qpmatrix.css`, so what you see is what an
 * app gets: same tokens, same cascade, same dark/light switch. The a11y panel
 * runs axe on every story.
 */
const meta = {
  title: "Primitives/Layout/Direction",
  component: DirectionProvider,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof DirectionProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <DirectionProvider direction="rtl">
        <div dir="rtl" className="flex flex-col gap-2">
          <p className="text-body-sm text-fg-muted">مجموعة أزرار في اتجاه من اليمين إلى اليسار</p>
          <ButtonGroup>
            <Button variant="outline">يوم</Button>
            <Button variant="outline">أسبوع</Button>
          </ButtonGroup>
        </div>
      </DirectionProvider>
    </>
  ),
};

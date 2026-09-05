import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";

/**
 * Button — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered here against the real `styles/qpmatrix.css`, so what you see is
 * what an app gets: same tokens, same cascade, same dark/light switch. The
 * a11y panel runs axe on every story.
 */
const meta = {
  title: "Primitives/Actions/Button",
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <Button>Run pipeline</Button>
    </>
  ),
};

const VARIANTS = ["default", "outline", "secondary", "ghost", "destructive", "link"] as const;
const SIZES = ["xs", "sm", "default", "lg"] as const;

/** Every variant side by side — the comparison a designer actually needs. */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {VARIANTS.map((variant) => (
        <Button key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {SIZES.map((size) => (
        <Button key={size} size={size}>
          {size}
        </Button>
      ))}
    </div>
  ),
};

/** Disabled is a state, not a variant — it applies across all of them. */
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {VARIANTS.map((variant) => (
        <Button key={variant} variant={variant} disabled>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

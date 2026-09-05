import type { Meta, StoryObj } from "@storybook/react-vite";

import { QPProductBadge } from "./product-badge";
import { QP_PRODUCT_BADGE_NAMES } from "./product-badge.constants";
import type { QPProductBadgeProduct } from "./product-badge.types";

const PRODUCTS = Object.keys(QP_PRODUCT_BADGE_NAMES) as QPProductBadgeProduct[];

const meta = {
  title: "Components/QPProductBadge",
  component: QPProductBadge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    product: { control: "select", options: PRODUCTS },
    children: { control: "text" },
  },
} satisfies Meta<typeof QPProductBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { product: "qpmatrix" },
};

/**
 * Every product side by side. The name is always rendered as text — the tone
 * is a recognition aid, never the thing that says which product it is.
 */
export const AllProducts: Story = {
  args: { product: "qpmatrix" },
  render: () => (
    <div className="flex max-w-md flex-wrap gap-2">
      {PRODUCTS.map((product) => (
        <QPProductBadge key={product} product={product} />
      ))}
    </div>
  ),
};

/** The default name is a brand proper noun and is fully overridable. */
export const CustomLabel: Story = {
  args: {
    product: "assistant",
    children: "المساعد",
  },
};

/** Composition: `render` swaps the element, inherited from `ui/badge`. */
export const AsLink: Story = {
  args: {
    product: "githubPipelines",
    render: <a href="#pipelines" />,
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";

import { QPText } from "./text";
import { QP_TEXT_VARIANT_CLASSES } from "./text.constants";
import type { QPTextVariant } from "./text.types";

const VARIANTS = Object.keys(QP_TEXT_VARIANT_CLASSES) as QPTextVariant[];

const meta = {
  title: "Typography/QPText",
  component: QPText,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: VARIANTS },
    tone: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "muted",
        "subtle",
        "inverse",
        "brand",
        "success",
        "warning",
        "error",
        "info",
      ],
    },
    font: { control: "select", options: ["sans", "display", "mono", "arabic", "hebrew"] },
    align: { control: "select", options: ["start", "center", "end"] },
    clamp: { control: "select", options: [undefined, 1, 2, 3] },
    children: { control: "text" },
  },
} satisfies Meta<typeof QPText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "The quick brown fox jumps over the lazy dog." },
};

/** The whole QPMatrix type ramp, straight from @qpmtx/tokens. */
export const Ramp: Story = {
  args: { children: "" },
  render: () => (
    <div className="flex flex-col gap-4">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-col gap-1">
          <QPText variant="label-sm" tone="muted" as="span">
            {variant}
          </QPText>
          <QPText variant={variant}>The quick brown fox</QPText>
        </div>
      ))}
    </div>
  ),
};

export const Tones: Story = {
  args: { children: "" },
  render: () => (
    <div className="flex flex-col gap-2">
      {(
        ["primary", "secondary", "muted", "brand", "success", "warning", "error", "info"] as const
      ).map((tone) => (
        <QPText key={tone} tone={tone}>
          {tone}
        </QPText>
      ))}
    </div>
  ),
};

/** Dashboard figures. Tabular by default so they do not jitter as they update. */
export const Metrics: Story = {
  args: { children: "" },
  render: () => (
    <div className="flex items-baseline gap-6">
      <QPText variant="metric-lg" as="span">
        1,284
      </QPText>
      <QPText variant="metric-compact" as="span">
        99.98%
      </QPText>
    </div>
  ),
};

/** Script-specific families, with the size and line-height adjustments tokens ship. */
export const Scripts: Story = {
  args: { children: "" },
  render: () => (
    <div className="flex flex-col gap-3">
      <QPText variant="body-lg">Latin — the quick brown fox</QPText>
      <QPText variant="body-lg" font="arabic" dir="rtl">
        العربية — نص تجريبي للعرض
      </QPText>
      <QPText variant="body-lg" font="hebrew" dir="rtl">
        עברית — טקסט לדוגמה
      </QPText>
      <QPText variant="code" font="mono">
        bun run registry:build
      </QPText>
    </div>
  ),
};

export const Clamped: Story = {
  args: {
    clamp: 2,
    className: "max-w-sm",
    children:
      "A long paragraph that will be clamped to two lines with an ellipsis, so a card in a grid keeps a predictable height no matter how much text the content author wrote.",
  },
};

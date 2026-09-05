import type { Meta, StoryObj } from "@storybook/react-vite";

import { QPText } from "../text";
import { QPMotion } from "../motion";
import { QPStagger } from "./stagger";

const meta = {
  title: "Motion/QPStagger",
  component: QPStagger,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    stagger: { control: "select", options: ["tight", "normal", "loose"] },
    reverse: { control: "boolean" },
    whenVisible: { control: "boolean" },
    as: { control: "select", options: ["div", "ul", "ol", "section"] },
  },
} satisfies Meta<typeof QPStagger>;

export default meta;
type Story = StoryObj<typeof meta>;

const ITEMS = ["Build", "Test", "Lint", "Typecheck", "Registry", "Accessibility"];

/** A grid of cards arriving in sequence. Reload to replay. */
export const Default: Story = {
  args: { children: null },
  render: (args) => (
    <QPStagger {...args} className="grid grid-cols-3 gap-3">
      {ITEMS.map((item) => (
        <QPMotion key={item} variant="rise">
          <div className="rounded-lg bg-surface-secondary px-4 py-6 text-center">
            <QPText variant="label" as="span">
              {item}
            </QPText>
          </div>
        </QPMotion>
      ))}
    </QPStagger>
  ),
};

/** A dense list wants the tight step — 30ms, so twelve rows finish quickly. */
export const TightList: Story = {
  args: { as: "ul", stagger: "tight", children: null },
  render: (args) => (
    <QPStagger {...args} className="flex max-w-sm flex-col gap-2">
      {ITEMS.map((item) => (
        <QPMotion key={item} as="li" variant="rise">
          <div className="rounded-md bg-surface-secondary px-3 py-2">
            <QPText variant="body-sm" as="span">
              {item}
            </QPText>
          </div>
        </QPMotion>
      ))}
    </QPStagger>
  ),
};

/**
 * `reverse` plays the last child first — what a bottom-anchored list such as
 * a chat log needs, so the newest message leads.
 */
export const Reversed: Story = {
  args: { as: "ul", reverse: true, children: null },
  render: (args) => (
    <QPStagger {...args} className="flex max-w-sm flex-col gap-2">
      {ITEMS.map((item) => (
        <QPMotion key={item} as="li" variant="rise">
          <div className="rounded-md bg-surface-secondary px-3 py-2">
            <QPText variant="body-sm" as="span">
              {item}
            </QPText>
          </div>
        </QPMotion>
      ))}
    </QPStagger>
  ),
};

/** Waits for the viewport, like QPReveal, but staggers what it contains. */
export const OnScroll: Story = {
  args: { whenVisible: true, children: null },
  render: (args) => (
    <div className="flex flex-col gap-[60vh]">
      <QPText tone="muted">Scroll down ↓</QPText>
      <QPStagger {...args} className="grid grid-cols-3 gap-3">
        {ITEMS.map((item) => (
          <QPMotion key={item} variant="rise">
            <div className="rounded-lg bg-surface-secondary px-4 py-6 text-center">
              <QPText variant="label" as="span">
                {item}
              </QPText>
            </div>
          </QPMotion>
        ))}
      </QPStagger>
    </div>
  ),
};

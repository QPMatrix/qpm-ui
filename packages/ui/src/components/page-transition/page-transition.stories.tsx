import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../ui/button";
import { QPHeading } from "../heading";
import { QPText } from "../text";
import { QPPageTransition } from "./page-transition";

const meta = {
  title: "Motion/QPPageTransition",
  component: QPPageTransition,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    pageKey: { control: "text" },
    variant: { control: "select", options: ["fade", "rise", "slideStart", "slideEnd"] },
    duration: { control: "select", options: ["fast", "standard", "slow"] },
  },
} satisfies Meta<typeof QPPageTransition>;

export default meta;
type Story = StoryObj<typeof meta>;

const PAGES = {
  "/runs": { title: "Recent runs", body: "4,102 runs this week across every pipeline." },
  "/settings": { title: "Settings", body: "Theme, notifications and access." },
  "/docs": { title: "Documentation", body: "Standards, tokens and the component registry." },
} as const;

export const Default: Story = {
  args: { pageKey: "/runs", children: null },
  render: (args) => {
    // A Storybook `render` function IS a component — Storybook calls it as
    // one — so the hook below is legitimate even though the name is lowercase.
    const [route, setRoute] = useState<keyof typeof PAGES>("/runs");
    const page = PAGES[route];

    return (
      <div className="flex flex-col gap-4">
        <nav className="flex gap-2">
          {(Object.keys(PAGES) as (keyof typeof PAGES)[]).map((key) => (
            <Button
              key={key}
              variant={key === route ? "default" : "outline"}
              onClick={() => {
                setRoute(key);
              }}
            >
              {key}
            </Button>
          ))}
        </nav>

        <QPPageTransition {...args} pageKey={route} className="rounded-xl bg-surface-secondary p-8">
          <QPHeading level={1} variant="display-md">
            {page.title}
          </QPHeading>
          <QPText tone="muted" className="mt-2">
            {page.body}
          </QPText>
        </QPPageTransition>
      </div>
    );
  },
};

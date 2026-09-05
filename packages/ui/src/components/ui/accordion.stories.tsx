import type { Meta, StoryObj } from "@storybook/react-vite";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./accordion";

/**
 * Accordion — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered here against the real `styles/qpmatrix.css`, so what you see is
 * what an app gets: same tokens, same cascade, same dark/light switch. The
 * a11y panel runs axe on every story.
 */
const meta = {
  title: "Primitives/Layout/Accordion",
  component: Accordion,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <Accordion className="w-80">
        <AccordionItem value="one">
          <AccordionTrigger>What is a registry item?</AccordionTrigger>
          <AccordionContent>A promise to a consumer about files, deps and tokens.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  ),
};

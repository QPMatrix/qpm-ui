import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "./input";
import { Field, FieldLabel, FieldDescription, FieldError, FieldContent } from "./field";

/**
 * Field — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered against the real `styles/qpmatrix.css`, so what you see is what an
 * app gets: same tokens, same cascade, same dark/light switch. The a11y panel
 * runs axe on every story.
 */
const meta = {
  title: "Primitives/Forms/Field",
  component: Field,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <Field className="w-72">
        <FieldLabel htmlFor="pipeline">Pipeline name</FieldLabel>
        <FieldContent>
          <Input id="pipeline" defaultValue="build-and-deploy" aria-invalid />
          <FieldDescription>Lowercase, hyphen-separated.</FieldDescription>
          <FieldError>A pipeline with that name already exists.</FieldError>
        </FieldContent>
      </Field>
    </>
  ),
};

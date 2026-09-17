import type { Meta, StoryObj } from "@storybook/react-vite";

import { QPSteps } from "./steps";
import type { QPStepItem } from "./steps.types";

const meta = {
  title: "Components/QPSteps",
  component: QPSteps,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
  },
} satisfies Meta<typeof QPSteps>;

export default meta;
type Story = StoryObj<typeof meta>;

const items: QPStepItem[] = [
  { id: "account", label: "Account", state: "completed" },
  { id: "workspace", label: "Workspace", state: "completed" },
  { id: "integrations", label: "Integrations", state: "current" },
  { id: "review", label: "Review", state: "upcoming" },
];

export const Default: Story = {
  args: { label: "Setup progress", items },
};

/** With `onStepClick`, completed steps become real buttons — never links. */
export const RevisitableCompletedSteps: Story = {
  args: {
    label: "Setup progress",
    items,
    onStepClick: (id) => {
      // eslint-disable-next-line no-console -- storybook action surface
      console.log("revisit", id);
    },
  },
};

export const Vertical: Story = {
  args: { label: "Setup progress", items, orientation: "vertical" },
};

const itemsWithDescriptions: QPStepItem[] = [
  {
    id: "account",
    label: "Create account",
    description: "Email and password",
    state: "completed",
  },
  {
    id: "workspace",
    label: "Name your workspace",
    description: "Visible to your team",
    state: "current",
  },
  {
    id: "invite",
    label: "Invite your team",
    description: "Optional — you can do this later",
    state: "upcoming",
  },
];

export const WithDescriptions: Story = {
  args: { label: "Setup progress", items: itemsWithDescriptions, orientation: "vertical" },
};

const disabledCompletedItems: QPStepItem[] = [
  { id: "account", label: "Account", state: "completed", disabled: true },
  { id: "workspace", label: "Workspace", state: "current" },
  { id: "review", label: "Review", state: "upcoming" },
];

/** A completed step can be individually locked from revisiting. */
export const DisabledCompletedStep: Story = {
  args: {
    label: "Setup progress",
    items: disabledCompletedItems,
    onStepClick: () => undefined,
  },
};

const rtlItems: QPStepItem[] = [
  { id: "account", label: "الحساب", state: "completed" },
  { id: "workspace", label: "مساحة العمل", state: "current" },
  { id: "review", label: "المراجعة", state: "upcoming" },
];

/** Every string is data: an RTL locale needs no component change. */
export const RightToLeft: Story = {
  args: { label: "تقدّم الإعداد", items: rtlItems },
};

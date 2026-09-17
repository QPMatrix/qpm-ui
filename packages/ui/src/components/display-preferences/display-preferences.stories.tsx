import type { Meta, StoryObj } from "@storybook/react-vite";

import { QP_DISPLAY_PREFERENCES_NOOP_ADAPTER } from "./display-preferences.constants";
import { QPDisplayPreferences } from "./display-preferences";

const meta = {
  title: "Components/QPDisplayPreferences",
  component: QPDisplayPreferences,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof QPDisplayPreferences>;

export default meta;
type Story = StoryObj<typeof meta>;

const textSizeItems = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

const colorSchemeItems = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

/**
 * `storageAdapter` is the no-op adapter in every story below, so re-visiting
 * this page never carries over a previous story's choice — see the
 * `Persisted` story for the real `localStorage`-backed default.
 */
export const Default: Story = {
  args: {
    legend: "Display",
    textSizeLabel: "Text size",
    textSizeItems,
    reducedMotionLabel: "Reduce motion",
    colorSchemeLabel: "Colour scheme",
    colorSchemeItems,
    storageAdapter: QP_DISPLAY_PREFERENCES_NOOP_ADAPTER,
  },
};

/** Omitting `storageAdapter` uses the real, guarded `localStorage` default. */
export const Persisted: Story = {
  args: {
    legend: "Display",
    textSizeLabel: "Text size",
    textSizeItems,
    reducedMotionLabel: "Reduce motion",
    colorSchemeLabel: "Colour scheme",
    colorSchemeItems,
  },
};

export const StartingReducedMotion: Story = {
  args: {
    legend: "Display",
    textSizeLabel: "Text size",
    textSizeItems,
    reducedMotionLabel: "Reduce motion",
    colorSchemeLabel: "Colour scheme",
    colorSchemeItems,
    defaultReducedMotion: true,
    storageAdapter: QP_DISPLAY_PREFERENCES_NOOP_ADAPTER,
  },
};

export const StartingLarge: Story = {
  args: {
    legend: "Display",
    textSizeLabel: "Text size",
    textSizeItems,
    reducedMotionLabel: "Reduce motion",
    colorSchemeLabel: "Colour scheme",
    colorSchemeItems,
    defaultTextSize: "lg",
    storageAdapter: QP_DISPLAY_PREFERENCES_NOOP_ADAPTER,
  },
};

/** Every string is a prop — an RTL locale needs no component change. */
export const RightToLeft: Story = {
  args: {
    legend: "العرض",
    textSizeLabel: "حجم النص",
    textSizeItems: [
      { value: "sm", label: "صغير" },
      { value: "md", label: "متوسط" },
      { value: "lg", label: "كبير" },
    ],
    reducedMotionLabel: "تقليل الحركة",
    colorSchemeLabel: "نظام الألوان",
    colorSchemeItems: [
      { value: "system", label: "النظام" },
      { value: "light", label: "فاتح" },
      { value: "dark", label: "داكن" },
    ],
    storageAdapter: QP_DISPLAY_PREFERENCES_NOOP_ADAPTER,
  },
};

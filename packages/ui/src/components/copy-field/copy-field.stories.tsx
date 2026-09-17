import type { Meta, StoryObj } from "@storybook/react-vite";

import { QPCopyField } from "./copy-field";

const meta = {
  title: "Components/QPCopyField",
  component: QPCopyField,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    value: { control: "text" },
    multiline: { control: "boolean" },
  },
} satisfies Meta<typeof QPCopyField>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * No `clipboard` prop, and Storybook's iframe usually has no
 * `navigator.clipboard` in an insecure context — press Copy to see the
 * failure path select the text instead.
 */
export const Default: Story = {
  args: { label: "Invite link", value: "https://app.qpmatrix.tech/invite/8f2a91" },
};

export const WithHint: Story = {
  args: {
    label: "API endpoint",
    value: "https://api.qpmatrix.tech/v1",
    hint: "Base URL for all requests.",
  },
};

export const Multiline: Story = {
  args: {
    label: "Public key",
    value:
      "-----BEGIN PUBLIC KEY-----\nMFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAMabc123...\n-----END PUBLIC KEY-----",
    multiline: true,
  },
};

/**
 * A `clipboard` that always resolves, so the demo can show the "Copied"
 * state without depending on the preview iframe's permissions.
 */
export const SuccessfulCopy: Story = {
  args: {
    label: "Invite link",
    value: "https://app.qpmatrix.tech/invite/8f2a91",
    clipboard: { writeText: async () => Promise.resolve() },
  },
};

/** A `clipboard` that always rejects — text is selected for manual copy. */
export const FailedCopy: Story = {
  args: {
    label: "Invite link",
    value: "https://app.qpmatrix.tech/invite/8f2a91",
    clipboard: {
      writeText: async () => Promise.reject(new Error("denied")),
    },
  },
};

/** Every string is a prop — an RTL locale needs no component change. */
export const RightToLeft: Story = {
  args: {
    label: "رابط الدعوة",
    value: "https://app.qpmatrix.tech/invite/8f2a91",
    copyLabel: "نسخ",
    copiedLabel: "تم النسخ",
    failedLabel: "فشل النسخ",
  },
};

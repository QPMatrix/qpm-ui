import type { Meta, StoryObj } from "@storybook/react-vite";

import { InputOTP, InputOTPGroup, InputOTPSlot } from "./input-otp";

/**
 * InputOtp — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered here against the real `styles/qpmatrix.css`, so what you see is
 * what an app gets: same tokens, same cascade, same dark/light switch. The
 * a11y panel runs axe on every story.
 */
const meta = {
  title: "Primitives/Forms/InputOtp",
  component: InputOTP,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof InputOTP>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { maxLength: 6, children: <div /> },
  render: () => (
    <>
      <InputOTP maxLength={6} aria-label="Verification code">
        <InputOTPGroup>
          {Array.from({ length: 6 }, (_unused, index) => (
            <InputOTPSlot key={index} index={index} />
          ))}
        </InputOTPGroup>
      </InputOTP>
    </>
  ),
};

import "../../test-setup";

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, mock, test } from "bun:test";

import { QPCopyField } from "./copy-field";
import { qpCopyFieldStatusMessage } from "./copy-field.utils";

async function setupUser() {
  const { default: userEvent } = await import("@testing-library/user-event");
  return userEvent.setup();
}

afterEach(() => {
  cleanup();
});

describe("QPCopyField", () => {
  test("the field has a real label, not just a placeholder (WCAG 2.2 SC 3.3.2)", () => {
    const { getByLabelText } = render(<QPCopyField label="Invite link" value="https://x/y" />);

    const field = getByLabelText("Invite link");
    expect(field).toHaveValue("https://x/y");
    expect(field).toHaveAttribute("readonly");
  });

  test("copy is a prop — an RTL label, value and button text render untouched", () => {
    const { getByLabelText, getByRole } = render(
      <QPCopyField label="رابط الدعوة" value="القيمة" copyLabel="نسخ" />,
    );

    expect(getByLabelText("رابط الدعوة")).toHaveValue("القيمة");
    expect(getByRole("button", { name: "نسخ" })).toBeInTheDocument();
  });

  test("has a data-slot for the field, the group, the value and the button", () => {
    const { container } = render(<QPCopyField label="Invite link" value="https://x/y" />);

    expect(container.querySelector('[data-slot="copy-field"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="copy-field-group"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="copy-field-value"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="copy-field-button"]')).toBeInTheDocument();
  });

  test("className merges last without clobbering the component's own classes", () => {
    const { container } = render(
      <QPCopyField label="Invite link" value="https://x/y" className="max-w-sm" />,
    );

    expect(container.querySelector('[data-slot="copy-field"]')?.className).toContain("max-w-sm");
  });

  test("multiline renders a textarea instead of an input", () => {
    const { getByLabelText } = render(
      <QPCopyField label="Public key" value="line one\nline two" multiline />,
    );

    expect(getByLabelText("Public key").tagName).toBe("TEXTAREA");
  });

  describe("AC-5 — copy succeeds", () => {
    test("the live region announces the copied message and the button's name is unchanged", async () => {
      const user = await setupUser();
      const writeText = mock<(text: string) => Promise<void>>(async () => Promise.resolve());
      const onCopy = mock<(value: string) => void>();
      const { getByRole } = render(
        <QPCopyField
          label="Invite link"
          value="https://x/y"
          clipboard={{ writeText }}
          onCopy={onCopy}
        />,
      );

      const button = getByRole("button", { name: "Copy" });
      await user.click(button);

      expect(writeText).toHaveBeenCalledWith("https://x/y");
      expect(getByRole("status")).toHaveTextContent("Copied");
      expect(getByRole("button", { name: "Copy" })).toBe(button);
      expect(onCopy).toHaveBeenCalledWith("https://x/y");
    });

    test("is reachable and operable by keyboard alone (WCAG 2.2 SC 2.1.1)", async () => {
      const user = await setupUser();
      const writeText = mock<(text: string) => Promise<void>>(async () => Promise.resolve());
      const { getByRole } = render(
        <QPCopyField label="Invite link" value="https://x/y" clipboard={{ writeText }} />,
      );

      const button = getByRole("button", { name: "Copy" });
      button.focus();
      expect(button).toHaveFocus();

      await user.keyboard("{Enter}");
      expect(writeText).toHaveBeenCalledTimes(1);
    });
  });

  describe("AC-5 — copy fails", () => {
    test("the live region announces the failure and the value's text is selected", async () => {
      const user = await setupUser();
      const writeText = mock<(text: string) => Promise<void>>(async () =>
        Promise.reject(new Error("denied")),
      );
      const onCopy = mock<(value: string) => void>();
      const { getByLabelText, getByRole } = render(
        <QPCopyField
          label="Invite link"
          value="https://x/y"
          clipboard={{ writeText }}
          onCopy={onCopy}
        />,
      );

      await user.click(getByRole("button", { name: "Copy" }));

      const field = getByLabelText("Invite link") as HTMLInputElement;
      expect(getByRole("status")).toHaveTextContent("Copy failed");
      expect(field.selectionStart).toBe(0);
      expect(field.selectionEnd).toBe(field.value.length);
      expect(onCopy).not.toHaveBeenCalled();
    });

    test("failure and success labels are props, overridable for localisation", async () => {
      const user = await setupUser();
      const writeText = mock<(text: string) => Promise<void>>(async () =>
        Promise.reject(new Error("denied")),
      );
      const { getByRole } = render(
        <QPCopyField
          label="Invite link"
          value="https://x/y"
          clipboard={{ writeText }}
          failedLabel="فشل النسخ"
        />,
      );

      await user.click(getByRole("button", { name: "Copy" }));
      expect(getByRole("status")).toHaveTextContent("فشل النسخ");
    });
  });

  test("a hint describes the field", () => {
    const { getByText } = render(
      <QPCopyField label="Invite link" value="https://x/y" hint="Expires in 7 days" />,
    );

    expect(getByText("Expires in 7 days")).toBeInTheDocument();
  });

  describe("pure helpers", () => {
    test("qpCopyFieldStatusMessage resolves each status to the right label", () => {
      expect(qpCopyFieldStatusMessage("idle", "Copied", "Copy failed")).toBe("");
      expect(qpCopyFieldStatusMessage("copied", "Copied", "Copy failed")).toBe("Copied");
      expect(qpCopyFieldStatusMessage("failed", "Copied", "Copy failed")).toBe("Copy failed");
    });
  });

  test("never logs the value: no console call fires on either the success or failure path", async () => {
    const user = await setupUser();
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const calls: unknown[] = [];
    console.log = (...args: unknown[]) => {
      calls.push(args);
    };
    console.error = (...args: unknown[]) => {
      calls.push(args);
    };
    console.warn = (...args: unknown[]) => {
      calls.push(args);
    };

    try {
      const writeText = mock<(text: string) => Promise<void>>(async () =>
        Promise.reject(new Error("denied")),
      );
      const { getByRole } = render(
        <QPCopyField label="Invite link" value="super-secret-value" clipboard={{ writeText }} />,
      );
      await user.click(getByRole("button", { name: "Copy" }));
    } finally {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    }

    expect(calls).toEqual([]);
  });

  test("has no axe violations", async () => {
    const { runAxe } = await import("../../testing/axe");
    const { container } = render(<QPCopyField label="Invite link" value="https://x/y" />);

    const results = await runAxe(container);
    expect(results.violations).toEqual([]);
  });
});

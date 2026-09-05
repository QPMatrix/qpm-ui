import "../../test-setup";

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, mock, test } from "bun:test";

import { QPComposer } from "./composer";
import { qpCanSubmitComposer } from "./composer.utils";

async function setupUser() {
  const { default: userEvent } = await import("@testing-library/user-event");
  return userEvent.setup();
}

afterEach(() => {
  cleanup();
});

const BASE = { label: "Message", submitLabel: "Send" } as const;

describe("QPComposer", () => {
  test("the field has a real label, not just a placeholder (WCAG 2.2 SC 3.3.2)", () => {
    const { getByLabelText } = render(<QPComposer {...BASE} placeholder="Type a message" />);

    const field = getByLabelText("Message");
    expect(field.tagName).toBe("TEXTAREA");
    expect(field).toHaveAttribute("placeholder", "Type a message");
  });

  test("every string is a prop — nothing English is baked in", () => {
    const { getByLabelText, getByRole } = render(
      <QPComposer label="الرسالة" submitLabel="إرسال" defaultValue="x" />,
    );

    expect(getByLabelText("الرسالة")).toBeInTheDocument();
    expect(getByRole("button", { name: "إرسال" })).toBeInTheDocument();
  });

  test("submits the trimmed text and clears when uncontrolled", async () => {
    const user = await setupUser();
    const onSubmit = mock<(value: string) => void>();
    const { getByLabelText, getByRole } = render(<QPComposer {...BASE} onSubmit={onSubmit} />);

    const field = getByLabelText("Message");
    await user.type(field, "  hello  ");
    await user.click(getByRole("button", { name: "Send" }));

    expect(onSubmit).toHaveBeenCalledWith("hello");
    expect(field).toHaveValue("");
  });

  test("Enter submits and Shift+Enter inserts a newline", async () => {
    const user = await setupUser();
    const onSubmit = mock<(value: string) => void>();
    const { getByLabelText } = render(<QPComposer {...BASE} onSubmit={onSubmit} />);

    const field = getByLabelText("Message");
    await user.type(field, "line one");
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    await user.type(field, "line two");
    expect(onSubmit).not.toHaveBeenCalled();

    await user.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledWith("line one\nline two");
  });

  test("submitOnEnter=false leaves Enter as a newline", async () => {
    const user = await setupUser();
    const onSubmit = mock<(value: string) => void>();
    const { getByLabelText } = render(
      <QPComposer {...BASE} submitOnEnter={false} onSubmit={onSubmit} />,
    );

    await user.type(getByLabelText("Message"), "hello");
    await user.keyboard("{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("an empty or whitespace-only field cannot be submitted", async () => {
    const user = await setupUser();
    const onSubmit = mock<(value: string) => void>();
    const { getByLabelText, getByRole } = render(<QPComposer {...BASE} onSubmit={onSubmit} />);

    expect(getByRole("button", { name: "Send" })).toBeDisabled();

    await user.type(getByLabelText("Message"), "   ");
    await user.keyboard("{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("qpCanSubmitComposer covers the empty, disabled and busy gates", () => {
    expect(qpCanSubmitComposer("hi", false, false)).toBe(true);
    expect(qpCanSubmitComposer("   ", false, false)).toBe(false);
    expect(qpCanSubmitComposer("hi", true, false)).toBe(false);
    expect(qpCanSubmitComposer("hi", false, true)).toBe(false);
  });

  test("controlled mode reports changes and never mutates its own value", async () => {
    const user = await setupUser();
    const onValueChange = mock<(value: string) => void>();
    const { getByLabelText } = render(
      <QPComposer {...BASE} value="fixed" onValueChange={onValueChange} />,
    );

    const field = getByLabelText("Message");
    await user.type(field, "x");

    expect(onValueChange).toHaveBeenCalledWith("fixedx");
    expect(field).toHaveValue("fixed");
  });

  test("an error marks the field invalid and becomes its description", () => {
    const { getByLabelText, getByRole } = render(
      <QPComposer {...BASE} hint="Markdown supported" error="Message is too long" />,
    );

    const field = getByLabelText("Message");
    expect(field).toHaveAttribute("aria-invalid", "true");

    const alert = getByRole("alert");
    expect(alert).toHaveTextContent("Message is too long");
    // The hint is dropped so AT announces one authoritative message.
    expect(field.getAttribute("aria-describedby")).toBe(alert.id);
  });

  test("a hint describes the field when there is no error", () => {
    const { container, getByLabelText } = render(
      <QPComposer {...BASE} hint="Markdown supported" />,
    );

    const field = getByLabelText("Message");
    const hint = container.querySelector('[data-slot="composer-hint"]');
    expect(field.getAttribute("aria-describedby")).toBe(hint?.id ?? "");
  });

  test("busy blocks submission while keeping the text readable", async () => {
    const user = await setupUser();
    const onSubmit = mock<(value: string) => void>();
    const { getByLabelText, getByRole } = render(
      <QPComposer {...BASE} busy defaultValue="hello" onSubmit={onSubmit} />,
    );

    expect(getByRole("button", { name: "Send" })).toBeDisabled();
    expect(getByLabelText("Message")).toHaveAttribute("readonly");

    await user.keyboard("{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("renders the toolbar slot and merges className last", () => {
    const { container, getByRole } = render(
      <QPComposer {...BASE} className="max-w-xl" toolbar={<button type="button">Attach</button>} />,
    );

    expect(getByRole("button", { name: "Attach" })).toBeInTheDocument();
    expect(container.querySelector('[data-slot="composer"]')?.className).toContain("max-w-xl");
  });

  test("has no axe violations", async () => {
    const { runAxe } = await import("../../testing/axe");
    const { container } = render(<QPComposer {...BASE} hint="Markdown supported" />);

    const results = await runAxe(container);
    expect(results.violations).toEqual([]);
  });
});

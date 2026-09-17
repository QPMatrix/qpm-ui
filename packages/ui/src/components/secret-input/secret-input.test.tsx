import "../../test-setup";

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, mock, test } from "bun:test";

import { QPSecretInput } from "./secret-input";
import {
  qpResolveSecretInputDescribedBy,
  qpSecretInputToggleLabel,
  qpSecretInputType,
} from "./secret-input.utils";

async function setupUser() {
  const { default: userEvent } = await import("@testing-library/user-event");
  return userEvent.setup();
}

afterEach(() => {
  cleanup();
});

describe("QPSecretInput", () => {
  test("the field has a real label, not just a placeholder (WCAG 2.2 SC 3.3.2)", () => {
    const { getByLabelText } = render(<QPSecretInput label="API key" />);

    expect(getByLabelText("API key")).toBeInTheDocument();
  });

  test("copy is a prop — an RTL label and hint render untouched", () => {
    const { getByLabelText, getByText } = render(
      <QPSecretInput label="مفتاح API" hint="مساعدة" showLabel="إظهار" hideLabel="إخفاء" />,
    );

    expect(getByLabelText("مفتاح API")).toBeInTheDocument();
    expect(getByText("مساعدة")).toBeInTheDocument();
  });

  test("has a data-slot for the field, the group and the toggle", () => {
    const { container } = render(<QPSecretInput label="API key" />);

    expect(container.querySelector('[data-slot="secret-input"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="secret-input-group"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="secret-input-toggle"]')).toBeInTheDocument();
  });

  test("className merges last without clobbering the component's own classes", () => {
    const { container } = render(<QPSecretInput label="API key" className="max-w-sm" />);

    expect(container.querySelector('[data-slot="secret-input"]')?.className).toContain("max-w-sm");
  });

  test("unknown native props and ref reach the input element", () => {
    const captured: { node: HTMLInputElement | null } = { node: null };
    const { getByLabelText } = render(
      <QPSecretInput
        label="API key"
        name="apiKey"
        ref={(element: HTMLInputElement | null) => {
          captured.node = element;
        }}
      />,
    );

    const field = getByLabelText("API key") as HTMLInputElement;
    expect(field).toHaveAttribute("name", "apiKey");
    expect(captured.node).toBe(field);
  });

  describe("AC-4 — visibility toggle", () => {
    test('defaults to type="password", aria-pressed="false"', () => {
      const { getByLabelText, getByRole } = render(<QPSecretInput label="API key" />);

      expect(getByLabelText("API key")).toHaveAttribute("type", "password");
      expect(getByRole("button", { name: "Show API key" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });

    test("toggling updates aria-pressed and the input type, and keeps focus on the toggle", async () => {
      const user = await setupUser();
      const { getByLabelText, getByRole } = render(<QPSecretInput label="API key" />);

      const toggle = getByRole("button", { name: "Show API key" });
      await user.click(toggle);

      expect(toggle).toHaveFocus();
      expect(getByLabelText("API key")).toHaveAttribute("type", "text");
      expect(getByRole("button", { name: "Hide API key" })).toHaveAttribute("aria-pressed", "true");

      await user.click(getByRole("button", { name: "Hide API key" }));
      expect(getByLabelText("API key")).toHaveAttribute("type", "password");
    });

    test("is reachable and operable by keyboard alone (WCAG 2.2 SC 2.1.1)", async () => {
      const user = await setupUser();
      const { getByLabelText, getByRole } = render(<QPSecretInput label="API key" />);

      const toggle = getByRole("button", { name: "Show API key" });
      toggle.focus();
      expect(toggle).toHaveFocus();

      await user.keyboard("{Enter}");
      expect(getByLabelText("API key")).toHaveAttribute("type", "text");
    });

    test("the toggle's accessible name folds in the field's own label", () => {
      const { getByRole } = render(<QPSecretInput label="Webhook secret" />);

      expect(getByRole("button", { name: "Show Webhook secret" })).toBeInTheDocument();
    });

    test("accepts custom icon elements, not string keys", async () => {
      const user = await setupUser();
      const { getByRole, getByTestId } = render(
        <QPSecretInput
          label="API key"
          showIcon={<svg data-testid="custom-show" />}
          hideIcon={<svg data-testid="custom-hide" />}
        />,
      );

      expect(getByTestId("custom-show")).toBeInTheDocument();
      await user.click(getByRole("button", { name: "Show API key" }));
      expect(getByTestId("custom-hide")).toBeInTheDocument();
    });
  });

  describe("AC-4 — the value never leaks into a non-value attribute", () => {
    test("the secret text appears only as the input's value, never in data-*, title or aria-*", async () => {
      const user = await setupUser();
      const secret = "sk-live-DO-NOT-LEAK";
      const { container, getByLabelText } = render(<QPSecretInput label="API key" />);

      await user.type(getByLabelText("API key"), secret);

      const root = container.querySelector('[data-slot="secret-input"]') as HTMLElement;
      for (const element of [root, ...Array.from(root.querySelectorAll("*"))]) {
        for (const attribute of Array.from(element.attributes)) {
          if (attribute.name === "value") {
            continue;
          }
          expect(attribute.value).not.toContain(secret);
        }
      }
      expect(getByLabelText("API key")).toHaveValue(secret);
    });
  });

  test("an error marks the field invalid and becomes its description", () => {
    const { getByLabelText, getByRole } = render(
      <QPSecretInput label="Token" hint="Format: sk-..." error="A token is required" />,
    );

    const field = getByLabelText("Token");
    expect(field).toHaveAttribute("aria-invalid", "true");

    const alert = getByRole("alert");
    expect(alert).toHaveTextContent("A token is required");
    expect(field.getAttribute("aria-describedby")).toBe(alert.id);
  });

  test("a hint describes the field when there is no error", () => {
    const { container, getByLabelText } = render(
      <QPSecretInput label="Token" hint="Format: sk-..." />,
    );

    const field = getByLabelText("Token");
    const hint = container.querySelector('[data-slot="secret-input"] p');
    expect(field.getAttribute("aria-describedby")).toBe(hint?.id ?? "");
  });

  test("uncontrolled: types and reports the raw value", async () => {
    const user = await setupUser();
    const onValueChange = mock<(value: string) => void>();
    const { getByLabelText } = render(
      <QPSecretInput label="API key" onValueChange={onValueChange} />,
    );

    await user.type(getByLabelText("API key"), "abc");

    expect(onValueChange).toHaveBeenLastCalledWith("abc");
    expect(getByLabelText("API key")).toHaveValue("abc");
  });

  test("controlled: the value prop wins and onValueChange still reports typing", async () => {
    const user = await setupUser();
    const onValueChange = mock<(value: string) => void>();
    const { getByLabelText } = render(
      <QPSecretInput label="API key" value="fixed" onValueChange={onValueChange} />,
    );

    const field = getByLabelText("API key");
    await user.type(field, "x");

    expect(onValueChange).toHaveBeenCalledWith("fixedx");
    expect(field).toHaveValue("fixed");
  });

  test("disabled disables both the field and the toggle", () => {
    const { getByLabelText, getByRole } = render(<QPSecretInput label="API key" disabled />);

    expect(getByLabelText("API key")).toBeDisabled();
    expect(getByRole("button", { name: "Show API key" })).toBeDisabled();
  });

  describe("pure helpers", () => {
    test("qpSecretInputType toggles between password and text", () => {
      expect(qpSecretInputType(false)).toBe("password");
      expect(qpSecretInputType(true)).toBe("text");
    });

    test("qpSecretInputToggleLabel combines the verb and the field label", () => {
      expect(qpSecretInputToggleLabel(false, "Show", "Hide", "API key")).toBe("Show API key");
      expect(qpSecretInputToggleLabel(true, "Show", "Hide", "API key")).toBe("Hide API key");
    });

    test("qpResolveSecretInputDescribedBy prefers the error over the hint", () => {
      expect(qpResolveSecretInputDescribedBy("bad", "help", "err", "hint")).toBe("err");
      expect(qpResolveSecretInputDescribedBy(undefined, "help", "err", "hint")).toBe("hint");
      expect(qpResolveSecretInputDescribedBy(undefined, undefined, "err", "hint")).toBeUndefined();
    });
  });

  test("has no axe violations", async () => {
    const { runAxe } = await import("../../testing/axe");
    const { container } = render(<QPSecretInput label="API key" hint="Format: sk-..." />);

    const results = await runAxe(container);
    expect(results.violations).toEqual([]);
  });
});

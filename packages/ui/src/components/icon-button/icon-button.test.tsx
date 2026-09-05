import "../../test-setup";

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, mock, test } from "bun:test";

import { QPIconButton } from "./icon-button";

// Queries come from each render() call's own return value — never the
// @testing-library/dom `screen` singleton, which binds `document` at
// module-evaluation time (see ../../test-setup for why that is not safe here).
async function setupUser() {
  const { default: userEvent } = await import("@testing-library/user-event");
  return userEvent.setup();
}

afterEach(() => {
  cleanup();
});

describe("QPIconButton", () => {
  test("renders a button whose accessible name is the label prop", () => {
    const { getByRole } = render(
      <QPIconButton label="Close dialog">
        <svg />
      </QPIconButton>,
    );

    const button = getByRole("button", { name: "Close dialog" });
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("aria-label", "Close dialog");
  });

  test("the accessible name is a prop, not a baked-in string", () => {
    const { getByRole } = render(
      <QPIconButton label="إغلاق">
        <svg />
      </QPIconButton>,
    );

    expect(getByRole("button", { name: "إغلاق" })).toBeInTheDocument();
  });

  test("composes ui/button rather than a bare element (data-slot is overridden)", () => {
    const { getByRole } = render(
      <QPIconButton label="Refresh">
        <svg />
      </QPIconButton>,
    );

    expect(getByRole("button", { name: "Refresh" })).toHaveAttribute("data-slot", "icon-button");
  });

  test("is keyboard operable: tab focuses it and Enter activates it", async () => {
    const user = await setupUser();
    const onClick = mock<() => void>();
    const { getByRole } = render(
      <QPIconButton label="Save" onClick={onClick}>
        <svg />
      </QPIconButton>,
    );

    const button = getByRole("button", { name: "Save" });
    await user.tab();
    expect(button).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("exposes disabled state and does not activate", async () => {
    const user = await setupUser();
    const onClick = mock<() => void>();
    const { getByRole } = render(
      <QPIconButton label="Delete" disabled onClick={onClick}>
        <svg />
      </QPIconButton>,
    );

    const button = getByRole("button", { name: "Delete" });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  test("size maps onto the primitive's icon footprints and className merges last", () => {
    const { getByRole } = render(
      <QPIconButton label="Add" size="lg" className="ms-4">
        <svg />
      </QPIconButton>,
    );

    const button = getByRole("button", { name: "Add" });
    expect(button.className).toContain("size-9");
    expect(button.className).toContain("ms-4");
  });

  test("render composition swaps the element and keeps the accessible name", () => {
    const { getByRole } = render(
      <QPIconButton label="Docs" render={<a href="/docs" />} nativeButton={false}>
        <svg />
      </QPIconButton>,
    );

    // `nativeButton={false}` tells Base UI the rendered element is not a
    // native button, so it supplies `role="button"` and `tabindex` itself.
    // The accessible ROLE therefore stays "button" even though the element is
    // an anchor — that is the primitive's contract, and asserting "link" here
    // would be asserting a bug.
    const control = getByRole("button", { name: "Docs" });
    expect(control.tagName).toBe("A");
    expect(control).toHaveAttribute("href", "/docs");
    expect(control).toHaveAttribute("tabindex", "0");
  });

  test("forwards native props and ref onto the rendered element", () => {
    // Captured through a mutable holder rather than a bare `let`: TypeScript
    // narrows a `let` initialised to `null` back to `null` at the assertion,
    // so `expect(node).toBe(button)` would not typecheck.
    const captured: { node: HTMLElement | null } = { node: null };
    const { getByRole } = render(
      <QPIconButton
        label="Copy"
        type="submit"
        ref={(element: HTMLElement | null) => {
          captured.node = element;
        }}
      >
        <svg />
      </QPIconButton>,
    );

    const button = getByRole("button", { name: "Copy" });
    expect(button).toHaveAttribute("type", "submit");
    expect(captured.node).toBe(button);
  });
});

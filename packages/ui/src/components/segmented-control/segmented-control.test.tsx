import "../../test-setup";

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, mock, test } from "bun:test";

import { QPSegmentedControl } from "./segmented-control";
import type { QPSegmentedControlItem } from "./segmented-control.types";

// Queries come from each render() call's own return value — never the
// @testing-library/dom `screen` singleton, which binds `document` at
// module-evaluation time (see ../../test-setup for why that is not safe here).
async function setupUser() {
  const { default: userEvent } = await import("@testing-library/user-event");
  return userEvent.setup();
}

const items: QPSegmentedControlItem[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

afterEach(() => {
  cleanup();
});

describe("QPSegmentedControl", () => {
  test("renders a named group of pressable segments", () => {
    const { getByRole, getAllByRole } = render(
      <QPSegmentedControl aria-label="Range" items={items} defaultValue="day" />,
    );

    expect(getByRole("group", { name: "Range" })).toBeInTheDocument();
    expect(getAllByRole("button")).toHaveLength(3);
  });

  test("all rendered copy comes from items — nothing is baked in", () => {
    const { getByRole, queryByText } = render(
      <QPSegmentedControl
        aria-label="النطاق"
        items={[
          { value: "day", label: "يوم" },
          { value: "week", label: "أسبوع" },
        ]}
        defaultValue="day"
      />,
    );

    expect(getByRole("button", { name: "يوم" })).toBeInTheDocument();
    expect(getByRole("button", { name: "أسبوع" })).toBeInTheDocument();
    expect(queryByText("Day")).not.toBeInTheDocument();
  });

  test("exposes selected state through aria-pressed", () => {
    const { getByRole } = render(
      <QPSegmentedControl aria-label="Range" items={items} defaultValue="week" />,
    );

    expect(getByRole("button", { name: "Day" })).toHaveAttribute("aria-pressed", "false");
    expect(getByRole("button", { name: "Week" })).toHaveAttribute("aria-pressed", "true");
  });

  test("clicking a segment selects it and reports a single string value", async () => {
    const user = await setupUser();
    const onValueChange = mock<(value: string) => void>();
    const { getByRole } = render(
      <QPSegmentedControl
        aria-label="Range"
        items={items}
        defaultValue="day"
        onValueChange={onValueChange}
      />,
    );

    await user.click(getByRole("button", { name: "Month" }));

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenLastCalledWith("month");
    expect(getByRole("button", { name: "Month" })).toHaveAttribute("aria-pressed", "true");
    expect(getByRole("button", { name: "Day" })).toHaveAttribute("aria-pressed", "false");
  });

  test("re-pressing the selected segment is a no-op, never a deselect", async () => {
    const user = await setupUser();
    const onValueChange = mock<(value: string) => void>();
    const { getByRole } = render(
      <QPSegmentedControl
        aria-label="Range"
        items={items}
        defaultValue="day"
        onValueChange={onValueChange}
      />,
    );

    await user.click(getByRole("button", { name: "Day" }));

    expect(onValueChange).not.toHaveBeenCalled();
    expect(getByRole("button", { name: "Day" })).toHaveAttribute("aria-pressed", "true");
  });

  test("a focused segment activates by keyboard and reports a single value", async () => {
    const user = await setupUser();
    const onValueChange = mock<(value: string) => void>();
    const { getByRole } = render(
      <QPSegmentedControl
        aria-label="Range"
        items={items}
        defaultValue="day"
        onValueChange={onValueChange}
      />,
    );

    /*
     * Focus is placed directly rather than reached with Tab.
     *
     * Base UI's ToggleGroup is a composite: exactly one item carries
     * `tabindex="0"` and the rest carry `-1`, and that assignment happens in an
     * effect driven by the browser's focus machinery. Under happy-dom the
     * effect does not establish it — verified by rendering a RAW
     * `<ToggleGroup>` with no QPMatrix wrapper, which shows the same
     * `tabindex="-1"` on every item. So `user.tab()` reaching the group is not
     * observable in this environment, and asserting it would be asserting
     * something the environment cannot answer either way.
     *
     * Arrow traversal between segments is driven by the same composite and is
     * equally unobservable here.
     *
     * What IS ours to prove — and is proven below — is that a focused segment
     * activates by keyboard and reports exactly ONE value, never an array and
     * never an empty selection. That never-empty rule is the only behaviour
     * this component adds on top of the primitive, and `qpNextSegmentedValue`
     * is unit-tested directly alongside it.
     *
     * Tab-reachability, the roving tabindex and arrow traversal are Base UI's.
     * They are on the manual list in docs/standards/accessibility.md — check
     * them in the Storybook story with a real keyboard.
     */
    const week = getByRole("button", { name: "Week" });
    week.focus();
    expect(week).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("week");
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  test("a disabled segment is exposed as disabled and cannot be selected", async () => {
    const user = await setupUser();
    const onValueChange = mock<(value: string) => void>();
    const { getByRole } = render(
      <QPSegmentedControl
        aria-label="Range"
        items={[...items.slice(0, 2), { value: "month", label: "Month", disabled: true }]}
        defaultValue="day"
        onValueChange={onValueChange}
      />,
    );

    const disabledSegment = getByRole("button", { name: "Month" });
    expect(disabledSegment).toBeDisabled();

    await user.click(disabledSegment);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("controlled value wins and className merges last", () => {
    const { getByRole } = render(
      <QPSegmentedControl aria-label="Range" items={items} value="month" className="w-full" />,
    );

    expect(getByRole("button", { name: "Month" })).toHaveAttribute("aria-pressed", "true");
    expect(getByRole("group", { name: "Range" }).className).toContain("w-full");
  });
});

import "../../test-setup";

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, mock, test } from "bun:test";

import { QPSteps } from "./steps";
import type { QPStepItem } from "./steps.types";
import {
  qpIsStepClickable,
  qpStepAriaCurrent,
  qpStepNumber,
  qpStepStateAnnouncement,
} from "./steps.utils";

async function setupUser() {
  const { default: userEvent } = await import("@testing-library/user-event");
  return userEvent.setup();
}

afterEach(() => {
  cleanup();
});

const items: QPStepItem[] = [
  { id: "account", label: "Account", state: "completed" },
  { id: "workspace", label: "Workspace", state: "current" },
  { id: "review", label: "Review", state: "upcoming" },
];

describe("QPSteps", () => {
  test("renders every step's label", () => {
    const { getByText } = render(<QPSteps label="Setup progress" items={items} />);

    expect(getByText("Account")).toBeInTheDocument();
    expect(getByText("Workspace")).toBeInTheDocument();
    expect(getByText("Review")).toBeInTheDocument();
  });

  test("copy is a prop — a non-Latin, RTL label renders untouched", () => {
    const { getByText, getByRole } = render(
      <QPSteps
        label="تقدّم الإعداد"
        items={[{ id: "account", label: "الحساب", state: "current" }]}
      />,
    );

    expect(getByRole("navigation", { name: "تقدّم الإعداد" })).toBeInTheDocument();
    expect(getByText("الحساب")).toBeInTheDocument();
  });

  test("has a data-slot for the root nav and every step", () => {
    const { container } = render(<QPSteps label="Setup progress" items={items} />);

    expect(container.querySelector('[data-slot="steps"]')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-slot="steps-item"]')).toHaveLength(3);
  });

  test("className merges last without clobbering the component's own classes", () => {
    const { container } = render(<QPSteps label="Setup progress" items={items} className="mt-8" />);

    const nav = container.querySelector('[data-slot="steps"]');
    expect(nav?.className).toContain("mt-8");
  });

  test("state selects a token-role indicator class, not a literal colour", () => {
    const { container } = render(<QPSteps label="Setup progress" items={items} />);

    const completed = container.querySelector(
      '[data-state="completed"] [data-slot="steps-indicator"]',
    );
    const current = container.querySelector('[data-state="current"] [data-slot="steps-indicator"]');
    const upcoming = container.querySelector(
      '[data-state="upcoming"] [data-slot="steps-indicator"]',
    );

    expect(completed?.className).toContain("bg-brand-primary");
    expect(current?.className).toContain("ring-brand-primary");
    expect(upcoming?.className).toContain("bg-surface-secondary");
  });

  test("unknown props reach the nav root", () => {
    const { getByRole } = render(
      <QPSteps label="Setup progress" items={items} data-testid="wizard-progress" />,
    );

    expect(getByRole("navigation", { name: "Setup progress" })).toHaveAttribute(
      "data-testid",
      "wizard-progress",
    );
  });

  describe("AC-3 — current state and completed state are never colour alone", () => {
    test('exactly one element carries aria-current="step"', () => {
      const { container } = render(<QPSteps label="Setup progress" items={items} />);

      const current = container.querySelectorAll('[aria-current="step"]');
      expect(current).toHaveLength(1);
      expect(current[0]).toHaveTextContent("Workspace");
    });

    test("a completed step exposes its state as text, not only as a check glyph", () => {
      const { getByText } = render(<QPSteps label="Setup progress" items={items} />);

      // The check icon is aria-hidden; the sr-only suffix is the real second
      // channel a screen reader announces alongside the label.
      expect(getByText("Completed", { exact: false })).toBeInTheDocument();
    });

    test("the current step also carries a screen-reader-only announcement", () => {
      const { getByText } = render(<QPSteps label="Setup progress" items={items} />);

      expect(getByText("Current step", { exact: false })).toBeInTheDocument();
    });

    test("an upcoming step carries no extra state announcement", () => {
      const { container } = render(<QPSteps label="Setup progress" items={items} />);

      const upcomingItem = container.querySelector('[data-state="upcoming"]');
      expect(upcomingItem?.querySelector(".sr-only")).toBeNull();
    });

    test("state announcements are props, overridable for localisation", () => {
      const { getByText } = render(
        <QPSteps
          label="التقدّم"
          items={[{ id: "account", label: "الحساب", state: "completed" }]}
          completedStateLabel="مكتمل"
        />,
      );

      expect(getByText("مكتمل", { exact: false })).toBeInTheDocument();
    });
  });

  describe("revisitable completed steps", () => {
    test("without onStepClick, no step renders as a button", () => {
      const { queryAllByRole } = render(<QPSteps label="Setup progress" items={items} />);

      expect(queryAllByRole("button")).toHaveLength(0);
    });

    test("with onStepClick, only completed steps render as buttons", () => {
      const { getByRole, queryByRole } = render(
        <QPSteps label="Setup progress" items={items} onStepClick={() => undefined} />,
      );

      expect(getByRole("button", { name: /Account/ })).toBeInTheDocument();
      expect(queryByRole("button", { name: /Workspace/ })).not.toBeInTheDocument();
      expect(queryByRole("button", { name: /Review/ })).not.toBeInTheDocument();
    });

    test("is reachable and operable by keyboard alone (WCAG 2.2 SC 2.1.1)", async () => {
      const user = await setupUser();
      const onStepClick = mock<(id: string) => void>();
      const { getByRole } = render(
        <QPSteps label="Setup progress" items={items} onStepClick={onStepClick} />,
      );

      const control = getByRole("button", { name: /Account/ });
      control.focus();
      expect(control).toHaveFocus();

      await user.keyboard("{Enter}");
      expect(onStepClick).toHaveBeenCalledWith("account");
    });

    test("clicking reports the step id", async () => {
      const user = await setupUser();
      const onStepClick = mock<(id: string) => void>();
      const { getByRole } = render(
        <QPSteps label="Setup progress" items={items} onStepClick={onStepClick} />,
      );

      await user.click(getByRole("button", { name: /Account/ }));
      expect(onStepClick).toHaveBeenCalledTimes(1);
      expect(onStepClick).toHaveBeenCalledWith("account");
    });

    test("an individually disabled completed step never becomes a button", () => {
      const { queryByRole } = render(
        <QPSteps
          label="Setup progress"
          items={[{ id: "account", label: "Account", state: "completed", disabled: true }]}
          onStepClick={() => undefined}
        />,
      );

      expect(queryByRole("button", { name: /Account/ })).not.toBeInTheDocument();
    });

    test("does not introduce a positive tabindex (WCAG 2.2 SC 2.4.3)", async () => {
      const { expectNoPositiveTabIndex } = await import("../../testing/a11y");
      const { container } = render(
        <QPSteps label="Setup progress" items={items} onStepClick={() => undefined} />,
      );

      expectNoPositiveTabIndex(container);
    });
  });

  describe("custom completed icon", () => {
    test("accepts an icon element, not a string key", () => {
      const { container } = render(
        <QPSteps
          label="Setup progress"
          items={[{ id: "account", label: "Account", state: "completed" }]}
          completedIcon={<svg data-testid="custom-icon" />}
        />,
      );

      expect(container.querySelector('[data-testid="custom-icon"]')).toBeInTheDocument();
    });
  });

  describe("pure helpers", () => {
    test("qpIsStepClickable is true only for a completed, non-disabled step with a handler", () => {
      const completed: QPStepItem = { id: "a", label: "A", state: "completed" };
      const current: QPStepItem = { id: "b", label: "B", state: "current" };
      const disabledCompleted: QPStepItem = {
        id: "c",
        label: "C",
        state: "completed",
        disabled: true,
      };

      expect(qpIsStepClickable(completed, true)).toBe(true);
      expect(qpIsStepClickable(completed, false)).toBe(false);
      expect(qpIsStepClickable(current, true)).toBe(false);
      expect(qpIsStepClickable(disabledCompleted, true)).toBe(false);
    });

    test('qpStepAriaCurrent is "step" only for the current item', () => {
      expect(qpStepAriaCurrent({ id: "a", label: "A", state: "current" })).toBe("step");
      expect(qpStepAriaCurrent({ id: "a", label: "A", state: "completed" })).toBeUndefined();
      expect(qpStepAriaCurrent({ id: "a", label: "A", state: "upcoming" })).toBeUndefined();
    });

    test("qpStepNumber is 1-based", () => {
      expect(qpStepNumber(0)).toBe(1);
      expect(qpStepNumber(3)).toBe(4);
    });

    test("qpStepStateAnnouncement returns undefined for an upcoming step", () => {
      expect(
        qpStepStateAnnouncement(
          { id: "a", label: "A", state: "upcoming" },
          "Completed",
          "Current step",
        ),
      ).toBeUndefined();
      expect(
        qpStepStateAnnouncement(
          { id: "a", label: "A", state: "completed" },
          "Completed",
          "Current step",
        ),
      ).toBe("Completed");
      expect(
        qpStepStateAnnouncement(
          { id: "a", label: "A", state: "current" },
          "Completed",
          "Current step",
        ),
      ).toBe("Current step");
    });
  });

  test("has no axe violations", async () => {
    const { runAxe } = await import("../../testing/axe");
    const { container } = render(
      <QPSteps label="Setup progress" items={items} onStepClick={() => undefined} />,
    );

    const results = await runAxe(container);
    expect(results.violations).toEqual([]);
  });
});

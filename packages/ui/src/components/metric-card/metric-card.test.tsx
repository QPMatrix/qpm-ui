import "../../test-setup";

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "bun:test";

import { QPMetricCard } from "./metric-card";

afterEach(() => {
  cleanup();
});

describe("QPMetricCard", () => {
  test("renders the label and value it is given", () => {
    const { getByText } = render(<QPMetricCard label="Active sessions" value="1,284" />);

    expect(getByText("Active sessions")).toBeInTheDocument();
    expect(getByText("1,284")).toBeInTheDocument();
  });

  test("the card is named by its label", () => {
    const { container } = render(<QPMetricCard label="Uptime" value="99.98%" />);

    const card = container.querySelector('[data-slot="metric-card"]');
    const labelId = card?.getAttribute("aria-labelledby");
    expect(labelId).toBeTruthy();
    expect(container.querySelector(`#${labelId ?? ""}`)).toHaveTextContent("Uptime");
  });

  test("all copy is a prop — nothing English is baked in", () => {
    const { getByText } = render(<QPMetricCard label="الجلسات النشطة" value="١٢٨٤" />);

    expect(getByText("الجلسات النشطة")).toBeInTheDocument();
    expect(getByText("١٢٨٤")).toBeInTheDocument();
  });

  test("trend exposes a readable sentence, not just a colour and a delta", () => {
    const { container, getByText } = render(
      <QPMetricCard
        label="Requests"
        value="4.2M"
        trend={{ direction: "up", value: "+12.4%", label: "up 12.4 percent versus last week" }}
      />,
    );

    const trend = container.querySelector('[data-slot="metric-card-trend"]');
    expect(trend).toHaveAttribute("data-direction", "up");
    expect(trend?.className).toContain("text-status-success");

    // The terse delta is decorative; the sentence is what gets announced.
    expect(trend?.querySelector("[aria-hidden='true']")).toHaveTextContent("+12.4%");
    expect(getByText("up 12.4 percent versus last week").className).toContain("sr-only");
  });

  test("a downward trend uses the error role and keeps its own sentence", () => {
    const { container } = render(
      <QPMetricCard
        label="Error budget"
        value="38%"
        trend={{ direction: "down", value: "-6pt", label: "down 6 points versus last week" }}
      />,
    );

    expect(container.querySelector('[data-slot="metric-card-trend"]')?.className).toContain(
      "text-status-error",
    );
  });

  test("loading swaps the value for skeletons and announces a localisable label", () => {
    const { container, getByText, queryByText } = render(
      <QPMetricCard label="Requests" value="4.2M" loading loadingLabel="جارٍ التحميل" />,
    );

    expect(container.querySelector('[data-slot="metric-card"]')).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(queryByText("4.2M")).toBeNull();
    expect(getByText("جارٍ التحميل").className).toContain("sr-only");
    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
  });

  test("the icon is decorative and never replaces the label", () => {
    const { container, getByText } = render(
      <QPMetricCard label="Users" value="12" icon={<svg data-testid="glyph" />} />,
    );

    expect(container.querySelector('[data-slot="metric-card-icon"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(getByText("Users")).toBeInTheDocument();
  });

  test("renders an action slot and a description when given", () => {
    const { container, getByRole, getByText } = render(
      <QPMetricCard
        label="Spend"
        value="$4,102"
        description="Billing period to date"
        action={<button type="button">Change range</button>}
      />,
    );

    expect(getByRole("button", { name: "Change range" })).toBeInTheDocument();
    expect(getByText("Billing period to date")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="card-action"]')).toBeInTheDocument();
  });

  test("composes ui/card and merges className last", () => {
    const { container } = render(
      <QPMetricCard label="Uptime" value="99.9%" className="w-64" size="sm" />,
    );

    const card = container.querySelector('[data-slot="metric-card"]');
    expect(card).toHaveAttribute("data-size", "sm");
    expect(card?.className).toContain("w-64");
    // Chrome inherited from the primitive rather than re-declared here.
    expect(card?.className).toContain("bg-card");
  });
});

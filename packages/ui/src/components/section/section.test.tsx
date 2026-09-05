import "../../test-setup";

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "bun:test";

import { QPSection } from "./section";
import { qpSectionLevel, qpSectionNaming } from "./section.utils";

afterEach(() => {
  cleanup();
});

describe("QPSection", () => {
  test("a visible heading names the region", () => {
    const { getByRole } = render(
      <QPSection heading="Recent runs" level={2}>
        content
      </QPSection>,
    );

    expect(getByRole("region", { name: "Recent runs" })).toBeInTheDocument();
    expect(getByRole("heading", { level: 2, name: "Recent runs" })).toBeInTheDocument();
  });

  test("`label` names it when there is no visible heading", () => {
    const { getByRole } = render(<QPSection label="Filters">content</QPSection>);

    expect(getByRole("region", { name: "Filters" })).toBeInTheDocument();
  });

  test("an UNNAMED section is downgraded to a div, never left anonymous", () => {
    // A <section> with no accessible name is not exposed as a landmark — it
    // becomes an anonymous group, which implies navigable structure that is
    // not there. A plain div is the honest fallback.
    const { container, queryByRole } = render(<QPSection>content</QPSection>);

    expect(queryByRole("region")).toBeNull();
    expect(container.querySelector('[data-slot="section"]')?.tagName).toBe("DIV");
  });

  test("the naming rule has exactly three outcomes", () => {
    expect(qpSectionNaming("Runs", undefined)).toBe("labelledby");
    expect(qpSectionNaming(undefined, "Filters")).toBe("label");
    expect(qpSectionNaming(undefined, undefined)).toBe("none");
    // `false` is what `flag && <X/>` evaluates to, and must not count as a heading.
    expect(qpSectionNaming(false, undefined)).toBe("none");
  });

  test("the heading level defaults to 2 but is always overridable", () => {
    expect(qpSectionLevel(undefined)).toBe(2);
    expect(qpSectionLevel(3)).toBe(3);

    const { getByRole } = render(
      <QPSection heading="Nested" level={3}>
        content
      </QPSection>,
    );
    expect(getByRole("heading", { level: 3 })).toBeInTheDocument();
  });

  test("renders eyebrow, description and action slots when given", () => {
    const { getByText, getByRole, container } = render(
      <QPSection
        heading="Recent runs"
        level={2}
        eyebrow="Activity"
        description="Last 24 hours"
        action={<button type="button">View all</button>}
      >
        content
      </QPSection>,
    );

    expect(getByText("Activity")).toBeInTheDocument();
    expect(getByText("Last 24 hours")).toBeInTheDocument();
    expect(getByRole("button", { name: "View all" })).toBeInTheDocument();
    expect(container.querySelector('[data-slot="section-header"]')).toBeInTheDocument();
  });

  test("no header block is rendered when there is nothing to put in it", () => {
    const { container } = render(<QPSection label="Bare">content</QPSection>);

    expect(container.querySelector('[data-slot="section-header"]')).toBeNull();
  });

  test("surface and spacing select token roles", () => {
    const { container } = render(
      <QPSection label="Tinted" surface="subtle" spacing="spacious">
        content
      </QPSection>,
    );

    const node = container.querySelector('[data-slot="section"]');
    expect(node?.className).toContain("bg-surface-secondary");
    expect(node?.className).toContain("py-16");
  });

  test("reveal still renders a named region", () => {
    const { getByRole } = render(
      <QPSection heading="Revealed" level={2} reveal>
        content
      </QPSection>,
    );

    expect(getByRole("region", { name: "Revealed" })).toBeInTheDocument();
  });

  test("has no axe violations", async () => {
    const { runAxe } = await import("../../testing/axe");
    const { container } = render(
      <QPSection heading="Audited" level={2} description="With a description">
        content
      </QPSection>,
    );

    const results = await runAxe(container);
    expect(results.violations).toEqual([]);
  });
});

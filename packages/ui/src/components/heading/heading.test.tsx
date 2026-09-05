import "../../test-setup";

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "bun:test";

import { QPHeading } from "./heading";
import { QP_HEADING_LEVEL_VARIANTS } from "./heading.constants";
import { qpHeadingTag, qpHeadingVariant } from "./heading.utils";

afterEach(() => {
  cleanup();
});

describe("QPHeading", () => {
  test("level decides the tag, and therefore the document outline", () => {
    const { getByRole } = render(<QPHeading level={2}>Recent runs</QPHeading>);

    const heading = getByRole("heading", { level: 2, name: "Recent runs" });
    expect(heading.tagName).toBe("H2");
  });

  test("every level renders its own heading element", () => {
    for (const level of [1, 2, 3, 4, 5, 6] as const) {
      const { getByRole, unmount } = render(<QPHeading level={level}>Heading</QPHeading>);
      expect(getByRole("heading", { level })).toBeInTheDocument();
      unmount();
    }
  });

  test("the visual step and the outline level are separable", () => {
    // Outline-level 3, display weight: legitimate when a subsection opens a
    // page. The point is that it has to be stated, not inferred from size.
    const { getByRole } = render(
      <QPHeading level={3} variant="display-md">
        Pipelines
      </QPHeading>,
    );

    const heading = getByRole("heading", { level: 3 });
    expect(heading.className).toContain("text-display-md");
  });

  test("level and variant agree unless told otherwise", () => {
    expect(qpHeadingVariant(2, undefined)).toBe(QP_HEADING_LEVEL_VARIANTS[2]);
    expect(qpHeadingVariant(2, "display-lg")).toBe("display-lg");
  });

  test("plain keeps the type style but contributes nothing to the outline", () => {
    const { container, queryByRole } = render(
      <QPHeading level={3} plain>
        Build #4102
      </QPHeading>,
    );

    expect(queryByRole("heading")).toBeNull();
    const node = container.querySelector('[data-slot="heading"]');
    expect(node?.tagName).toBe("SPAN");
    expect(node?.className).toContain("text-h3");
  });

  test("qpHeadingTag maps level and plain to a tag", () => {
    expect(qpHeadingTag(1, false)).toBe("h1");
    expect(qpHeadingTag(6, false)).toBe("h6");
    expect(qpHeadingTag(1, true)).toBe("span");
  });

  test("exposes its level as a data attribute for styling and tests", () => {
    const { container } = render(<QPHeading level={4}>Four</QPHeading>);

    expect(container.querySelector('[data-slot="heading"]')).toHaveAttribute("data-level", "4");
  });

  test("copy is a prop — nothing English is baked in", () => {
    const { getByRole } = render(<QPHeading level={2}>عمليات التشغيل</QPHeading>);

    expect(getByRole("heading", { level: 2, name: "عمليات التشغيل" })).toBeInTheDocument();
  });

  test("className merges last and native props reach the element", () => {
    const { container } = render(
      <QPHeading level={2} className="mb-4" id="runs">
        Runs
      </QPHeading>,
    );

    const node = container.querySelector("#runs");
    expect(node?.className).toContain("mb-4");
  });

  test("has no axe violations", async () => {
    const { runAxe } = await import("../../testing/axe");
    const { container } = render(<QPHeading level={1}>Audited</QPHeading>);

    const results = await runAxe(container);
    expect(results.violations).toEqual([]);
  });
});

import "../../test-setup";

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "bun:test";

import { QPPageContainer } from "./page-container";
import { QP_PAGE_WIDTH_CLASSES } from "./page-container.constants";
import { qpIsMainLandmark, qpIsMeasured } from "./page-container.utils";

afterEach(() => {
  cleanup();
});

describe("QPPageContainer", () => {
  test("renders its content inside a centred measure", () => {
    const { container, getByText } = render(<QPPageContainer>Page</QPPageContainer>);

    expect(getByText("Page")).toBeInTheDocument();
    const node = container.querySelector('[data-slot="page-container"]');
    expect(node?.className).toContain("mx-auto");
  });

  test("defaults to a div, NOT the main landmark", () => {
    // A page may have exactly one <main>. Defaulting to it would mean every
    // nested container silently claimed the landmark.
    const { container, queryByRole } = render(<QPPageContainer>Page</QPPageContainer>);

    expect(container.querySelector('[data-slot="page-container"]')?.tagName).toBe("DIV");
    expect(queryByRole("main")).toBeNull();
  });

  test('as="main" opts into the landmark explicitly', () => {
    const { getByRole } = render(<QPPageContainer as="main">Page</QPPageContainer>);

    expect(getByRole("main")).toBeInTheDocument();
    expect(qpIsMainLandmark("main")).toBe(true);
    expect(qpIsMainLandmark("div")).toBe(false);
  });

  test("width is a prop, and `full` opts out of the measure", () => {
    const { container, rerender } = render(<QPPageContainer width="prose">Page</QPPageContainer>);
    const node = () => container.querySelector('[data-slot="page-container"]');

    expect(node()?.className).toContain(QP_PAGE_WIDTH_CLASSES.prose);
    expect(qpIsMeasured("prose")).toBe(true);

    rerender(<QPPageContainer width="full">Page</QPPageContainer>);
    expect(node()?.className).toContain("max-w-none");
    expect(qpIsMeasured("full")).toBe(false);
  });

  test("the prose measure is expressed in characters, not pixels", () => {
    // The constraint is characters per line, which `ch` tracks per font — so
    // an Arabic or monospace page gets a width suited to its own glyphs.
    expect(QP_PAGE_WIDTH_CLASSES.prose).toContain("ch");
  });

  test("padding is a token-scaled prop", () => {
    const { container } = render(<QPPageContainer padding="spacious">Page</QPPageContainer>);

    expect(container.querySelector('[data-slot="page-container"]')?.className).toContain("py-16");
  });

  test("inline gutters survive padding=none, so content never touches the edge", () => {
    const { container } = render(<QPPageContainer padding="none">Page</QPPageContainer>);

    expect(container.querySelector('[data-slot="page-container"]')?.className).toContain("px-4");
  });

  test("animate renders through the motion layer", () => {
    const { container } = render(<QPPageContainer animate>Page</QPPageContainer>);

    expect(container.querySelector('[data-slot="page-container"]')).toBeInTheDocument();
  });

  test("className merges last and native props reach the element", () => {
    const { container } = render(
      <QPPageContainer className="bg-surface-secondary" id="page">
        Page
      </QPPageContainer>,
    );

    expect(container.querySelector("#page")?.className).toContain("bg-surface-secondary");
  });

  test("has no axe violations", async () => {
    const { runAxe } = await import("../../testing/axe");
    const { container } = render(<QPPageContainer as="main">Audited</QPPageContainer>);

    const results = await runAxe(container);
    expect(results.violations).toEqual([]);
  });
});

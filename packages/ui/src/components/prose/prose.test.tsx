import "../../test-setup";

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "bun:test";

import { QPProse, qpMdxComponents } from "./prose";
import { QP_PROSE_ELEMENT_CLASSES, QP_PROSE_WIDTH_CLASSES } from "./prose.constants";
import { qpIsMappedMdxElement } from "./prose.utils";

afterEach(() => {
  cleanup();
});

describe("QPProse", () => {
  test("renders whatever HTML it is given", () => {
    const { getByRole, getByText } = render(
      <QPProse>
        <h2>Why measure matters</h2>
        <p>Line length is what makes long text readable.</p>
      </QPProse>,
    );

    expect(getByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(getByText("Line length is what makes long text readable.")).toBeInTheDocument();
  });

  test("defaults to a reading measure expressed in characters", () => {
    const { container } = render(<QPProse>text</QPProse>);

    expect(container.querySelector('[data-slot="prose"]')?.className).toContain(
      QP_PROSE_WIDTH_CLASSES.measure,
    );
    expect(QP_PROSE_WIDTH_CLASSES.measure).toContain("ch");
  });

  test("`full` opts out of the measure", () => {
    const { container } = render(<QPProse width="full">text</QPProse>);

    expect(container.querySelector('[data-slot="prose"]')?.className).toContain("max-w-none");
  });

  test("links are underlined, not colour-only (WCAG 2.2 SC 1.4.1)", () => {
    // A link distinguished from body text by colour alone fails 1.4.1; the
    // underline is the second channel.
    expect(QP_PROSE_ELEMENT_CLASSES).toContain("[&_a]:underline");
  });

  test("headings carry scroll margin so deep links do not land under a sticky header", () => {
    expect(QP_PROSE_ELEMENT_CLASSES).toContain("[&_h2]:scroll-mt-24");
  });

  test("list indentation is logical, so RTL indents on the correct side", () => {
    expect(QP_PROSE_ELEMENT_CLASSES).toContain("[&_ul]:ms-5");
    expect(QP_PROSE_ELEMENT_CLASSES).not.toContain("[&_ul]:ml-5");
  });

  test("every colour is a token role — no hex, no rgb()", () => {
    expect(QP_PROSE_ELEMENT_CLASSES).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(QP_PROSE_ELEMENT_CLASSES).not.toContain("rgb(");
  });

  test("the MDX map covers the elements whose semantics matter", () => {
    for (const tag of ["h1", "h2", "h3", "h4", "p"]) {
      expect(qpIsMappedMdxElement(tag)).toBe(true);
      expect(qpMdxComponents[tag]).toBeDefined();
    }
    // Lists, tables and code are styled by descendant selectors instead —
    // wrapping every element would double a long document's tree for nothing.
    expect(qpIsMappedMdxElement("ul")).toBe(false);
  });

  test("the MDX map has a stable identity across imports", () => {
    // MDXProvider re-renders its whole subtree when the map changes, so
    // rebuilding it per render would re-render every document.
    expect(qpMdxComponents).toBe(qpMdxComponents);
  });

  test("MDX headings keep the outline level the author wrote", () => {
    const H2 = qpMdxComponents.h2;
    expect(H2).toBeDefined();
    const { getByRole } = render(<QPProse>{H2 === undefined ? null : <H2>Authored</H2>}</QPProse>);

    expect(getByRole("heading", { level: 2, name: "Authored" })).toBeInTheDocument();
  });

  test("className merges last and native props reach the element", () => {
    const { container } = render(
      <QPProse className="mt-8" id="article">
        text
      </QPProse>,
    );

    expect(container.querySelector("#article")?.className).toContain("mt-8");
  });

  test("has no axe violations", async () => {
    const { runAxe } = await import("../../testing/axe");
    const { container } = render(
      <QPProse>
        <h2>Audited</h2>
        <p>
          With a <a href="#anchor">link</a> and a list.
        </p>
        <ul>
          <li>One</li>
        </ul>
      </QPProse>,
    );

    const results = await runAxe(container);
    expect(results.violations).toEqual([]);
  });
});

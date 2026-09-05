import "../../test-setup";

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "bun:test";

import { QPText } from "./text";
import { QP_TEXT_VARIANT_CLASSES } from "./text.constants";
import { qpDefaultTextElement, qpTextClampClass, qpTextFontClass } from "./text.utils";

afterEach(() => {
  cleanup();
});

describe("QPText", () => {
  test("renders its content", () => {
    const { getByText } = render(<QPText>Rolling 7-day window</QPText>);

    expect(getByText("Rolling 7-day window")).toBeInTheDocument();
  });

  test("defaults to a paragraph at body size", () => {
    const { container } = render(<QPText>Body</QPText>);

    const node = container.querySelector('[data-slot="text"]');
    expect(node?.tagName).toBe("P");
    expect(node?.className).toContain("text-body");
  });

  test("variant and element are INDEPENDENT decisions", () => {
    // The whole reason this component exists: how text looks and what it is
    // are separate, so a display-sized figure can still be a <span>.
    const { container } = render(
      <QPText variant="display-lg" as="span">
        4.2M
      </QPText>,
    );

    const node = container.querySelector('[data-slot="text"]');
    expect(node?.tagName).toBe("SPAN");
    expect(node?.className).toContain("text-display-lg");
    expect(node).toHaveAttribute("data-variant", "display-lg");
  });

  test("every ramp step resolves to a QPMatrix utility, never Tailwind's own scale", () => {
    for (const [variant, classes] of Object.entries(QP_TEXT_VARIANT_CLASSES)) {
      // `text-sm`/`text-2xl` know nothing about the QPMatrix ramp; every step
      // here must name a token-backed utility declared in styles/qpmatrix.css.
      expect(classes).toContain(`text-${variant}`);
    }
  });

  test("tone selects a token role", () => {
    const { container } = render(<QPText tone="muted">Muted</QPText>);

    expect(container.querySelector('[data-slot="text"]')?.className).toContain("text-fg-muted");
  });

  test("metric variants are tabular so figures do not jitter as they update", () => {
    const { container } = render(<QPText variant="metric-lg">1,284</QPText>);

    expect(container.querySelector('[data-slot="text"]')?.className).toContain("tabular-nums");
  });

  test("script fonts are available for non-Latin copy", () => {
    const { container } = render(
      <QPText font="arabic" dir="rtl">
        مرحبا
      </QPText>,
    );

    expect(container.querySelector('[data-slot="text"]')?.className).toContain("font-arabic");
  });

  test("alignment is logical, so it flips under RTL", () => {
    const { container } = render(<QPText align="end">End</QPText>);

    const className = container.querySelector('[data-slot="text"]')?.className ?? "";
    expect(className).toContain("text-end");
    expect(className).not.toContain("text-right");
  });

  test("clamp is opt-in and off by default", () => {
    const { container, rerender } = render(<QPText>Long</QPText>);
    const node = () => container.querySelector('[data-slot="text"]');

    expect(node()?.className).not.toContain("line-clamp");

    rerender(<QPText clamp={2}>Long</QPText>);
    expect(node()?.className).toContain("line-clamp-2");
  });

  test("helpers resolve the optional props", () => {
    expect(qpTextFontClass(undefined)).toBe("");
    expect(qpTextFontClass("mono")).toBe("font-mono");
    expect(qpTextClampClass(undefined)).toBe("");
    expect(qpTextClampClass(3)).toBe("line-clamp-3");
  });

  test("heading variants still default to a paragraph, never an <h*>", () => {
    // A visual h2 is not necessarily an outline-level 2. Emitting <h2> here
    // would let the document outline be decided by a type size.
    expect(qpDefaultTextElement("h2")).toBe("p");
    expect(qpDefaultTextElement("code")).toBe("code");
    expect(qpDefaultTextElement("label")).toBe("span");
  });

  test("className merges last and native props reach the element", () => {
    const { container } = render(
      <QPText className="mt-4" id="copy" data-testid="text">
        Merged
      </QPText>,
    );

    const node = container.querySelector("#copy");
    expect(node?.className).toContain("mt-4");
    expect(node).toHaveAttribute("data-testid", "text");
  });

  test("has no axe violations", async () => {
    const { runAxe } = await import("../../testing/axe");
    const { container } = render(<QPText>Audited</QPText>);

    const results = await runAxe(container);
    expect(results.violations).toEqual([]);
  });
});

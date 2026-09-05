import "../../test-setup";

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "bun:test";

import { QPReveal } from "./reveal";
import { QP_REVEAL_DEFAULT_AMOUNT, QP_REVEAL_DEFAULT_VARIANT } from "./reveal.constants";
import { qpRevealViewport } from "./reveal.utils";

afterEach(() => {
  cleanup();
});

describe("QPReveal", () => {
  test("renders its children", () => {
    const { getByText } = render(<QPReveal>Content</QPReveal>);

    expect(getByText("Content")).toBeInTheDocument();
  });

  test("renders the element the document needs", () => {
    const { container } = render(<QPReveal as="section">Content</QPReveal>);

    expect(container.querySelector('[data-slot="reveal"]')?.tagName).toBe("SECTION");
  });

  test("plays ONCE by default", () => {
    // Replaying on every re-entry makes a page feel unstable and punishes a
    // reader for scrolling back to re-read something.
    expect(qpRevealViewport({ repeat: false, amount: 0.2 })).toEqual({ once: true, amount: 0.2 });
  });

  test("`repeat` is the explicit opt-in to replaying", () => {
    expect(qpRevealViewport({ repeat: true, amount: 0.2 }).once).toBe(false);
  });

  test("the threshold is high enough that the reader has arrived", () => {
    // A 0-ish threshold fires when the block grazes the viewport edge, which
    // on a tall section can be a full screen before any of it is readable.
    expect(QP_REVEAL_DEFAULT_AMOUNT).toBeGreaterThan(0.1);
    expect(QP_REVEAL_DEFAULT_AMOUNT).toBeLessThanOrEqual(0.5);
  });

  test("uses the longer-travel `reveal` variant, not QPMotion's `rise`", () => {
    expect(QP_REVEAL_DEFAULT_VARIANT).toBe("reveal");
  });

  test("amount is a prop", () => {
    expect(qpRevealViewport({ repeat: false, amount: 0.75 }).amount).toBe(0.75);
  });

  test("className merges and native props reach the element", () => {
    const { container } = render(
      <QPReveal className="mt-8" id="revealed">
        Content
      </QPReveal>,
    );

    expect(container.querySelector("#revealed")?.className).toContain("mt-8");
  });

  test("has no axe violations", async () => {
    const { runAxe } = await import("../../testing/axe");
    const { container } = render(<QPReveal>Audited</QPReveal>);

    const results = await runAxe(container);
    expect(results.violations).toEqual([]);
  });
});

import "../../test-setup";

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "bun:test";

import { QPTypingIndicator } from "./typing-indicator";
import { QP_TYPING_INDICATOR_DEFAULT_LABEL } from "./typing-indicator.constants";
import { qpDotDelayClass, qpResolveDotCount } from "./typing-indicator.utils";

afterEach(() => {
  cleanup();
});

describe("QPTypingIndicator", () => {
  test("is a polite live region carrying the state as text", () => {
    const { container, getByText } = render(<QPTypingIndicator />);

    const root = container.querySelector('[data-slot="typing-indicator"]');
    expect(root).toHaveAttribute("role", "status");
    expect(root).toHaveAttribute("aria-live", "polite");
    expect(getByText(QP_TYPING_INDICATOR_DEFAULT_LABEL).className).toContain("sr-only");
  });

  test("the label is overridable for localised apps", () => {
    const { getByText } = render(<QPTypingIndicator label="المساعد يكتب" />);

    expect(getByText("المساعد يكتب")).toBeInTheDocument();
  });

  test("the dots are decorative and hidden from assistive technology", () => {
    const { container } = render(<QPTypingIndicator />);

    const dotWrapper = container.querySelector('[aria-hidden="true"]');
    expect(dotWrapper).not.toBeNull();
    expect(container.querySelectorAll('[data-slot="typing-indicator-dot"]')).toHaveLength(3);
  });

  test("dotCount is a prop, and a nonsensical value cannot crash the render", () => {
    const { container, rerender } = render(<QPTypingIndicator dotCount={5} />);
    const dots = () => container.querySelectorAll('[data-slot="typing-indicator-dot"]');

    expect(dots()).toHaveLength(5);

    rerender(<QPTypingIndicator dotCount={-3} />);
    expect(dots()).toHaveLength(0);

    rerender(<QPTypingIndicator dotCount={2.9} />);
    expect(dots()).toHaveLength(2);
  });

  test("qpResolveDotCount clamps every hostile input", () => {
    expect(qpResolveDotCount(3)).toBe(3);
    expect(qpResolveDotCount(0)).toBe(0);
    expect(qpResolveDotCount(-1)).toBe(0);
    expect(qpResolveDotCount(2.9)).toBe(2);
    expect(qpResolveDotCount(Number.NaN)).toBe(0);
    expect(qpResolveDotCount(Number.POSITIVE_INFINITY)).toBe(0);
  });

  test("the animation is suppressed under prefers-reduced-motion", () => {
    const { container } = render(<QPTypingIndicator />);

    const dot = container.querySelector('[data-slot="typing-indicator-dot"]');
    // `motion-safe:` means the bounce simply never applies under
    // reduce — the live-region text is what carries the state either way.
    expect(dot?.className).toContain("motion-safe:animate-bounce");
  });

  test("the stagger cycles so any dot count keeps a wave", () => {
    expect(qpDotDelayClass(0)).toBe("");
    expect(qpDotDelayClass(1)).toContain("animation-delay");
    expect(qpDotDelayClass(3)).toBe(qpDotDelayClass(0));
  });

  test("className and dotClassName both merge last", () => {
    const { container } = render(<QPTypingIndicator className="ms-2" dotClassName="size-3" />);

    expect(container.querySelector('[data-slot="typing-indicator"]')?.className).toContain("ms-2");
    expect(container.querySelector('[data-slot="typing-indicator-dot"]')?.className).toContain(
      "size-3",
    );
  });

  test("has no axe violations", async () => {
    const { runAxe } = await import("../../testing/axe");
    const { container } = render(<QPTypingIndicator />);

    const results = await runAxe(container);
    expect(results.violations).toEqual([]);
  });
});

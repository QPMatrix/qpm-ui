import "../../test-setup";

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "bun:test";

import { QP_DURATION, QP_EASE, QP_VARIANTS } from "../../lib/motion/motion-core.constants";
import { QPMotion } from "./motion";
import { QP_MOTION_DEFAULT_VARIANT } from "./motion.constants";
import { qpResolveTransition, qpResolveVariants } from "./motion.utils";

afterEach(() => {
  cleanup();
});

describe("QPMotion", () => {
  test("renders its children", () => {
    const { getByText } = render(<QPMotion>Content</QPMotion>);

    expect(getByText("Content")).toBeInTheDocument();
  });

  test("renders the element the document needs", () => {
    const { container } = render(<QPMotion as="section">Content</QPMotion>);

    expect(container.querySelector('[data-slot="motion"]')?.tagName).toBe("SECTION");
  });

  test("defaults to `rise` — the quietest entrance that still reads as arrival", () => {
    expect(QP_MOTION_DEFAULT_VARIANT).toBe("rise");
  });

  test("reduced motion removes MOVEMENT, not the element", () => {
    // The core accessibility guarantee (WCAG 2.2 SC 2.3.3): under reduce the
    // transform is gone entirely, and only opacity survives — a cross-fade
    // involves no vestibular motion but still signals arrival.
    const reduced = qpResolveVariants("rise", true);
    expect(reduced.hidden).toEqual({ opacity: 0 });
    expect(reduced.visible).toEqual({ opacity: 1 });

    const normal = qpResolveVariants("rise", false);
    expect(normal.hidden).toEqual(QP_VARIANTS.rise.hidden);
  });

  test("every named variant survives the reduced-motion reducer", () => {
    for (const name of Object.keys(QP_VARIANTS) as (keyof typeof QP_VARIANTS)[]) {
      const reduced = qpResolveVariants(name, true);
      for (const state of Object.values(reduced)) {
        // No transform, no size change — those are what a reduce user asked
        // not to see. `y`, `x`, `scale` and `height` must all be gone.
        expect(state).not.toHaveProperty("y");
        expect(state).not.toHaveProperty("x");
        expect(state).not.toHaveProperty("scale");
        expect(state).not.toHaveProperty("height");
      }
    }
  });

  test("resolving variants never hands out a shared object", () => {
    // A shared object would let one component's transition override leak into
    // every other user of the same variant name.
    expect(qpResolveVariants("rise", false)).not.toBe(QP_VARIANTS.rise);
  });

  test("transitions resolve from tokens, in override order", () => {
    expect(qpResolveTransition({})).toMatchObject({
      duration: QP_DURATION.standard,
      ease: QP_EASE.standard,
    });
    expect(qpResolveTransition({ duration: "fast" }).duration).toBe(QP_DURATION.fast);
    expect(qpResolveTransition({ ease: "out" }).ease).toBe(QP_EASE.out);
    // The raw object wins over the token names …
    expect(qpResolveTransition({ duration: "fast", transition: { duration: 9 } }).duration).toBe(9);
    // … but the delay is applied last, so a stagger parent cannot be overridden.
    expect(qpResolveTransition({ transition: { duration: 9 }, delay: 0.5 }).delay).toBe(0.5);
  });

  test("no duration is a bare number — every one is a token", () => {
    for (const value of Object.values(QP_DURATION)) {
      expect(typeof value).toBe("number");
      expect(value).toBeGreaterThan(0);
    }
  });

  test("className merges and native props reach the element", () => {
    const { container } = render(
      <QPMotion className="mt-4" id="animated">
        Content
      </QPMotion>,
    );

    expect(container.querySelector("#animated")?.className).toContain("mt-4");
  });

  test("has no axe violations", async () => {
    const { runAxe } = await import("../../testing/axe");
    const { container } = render(<QPMotion>Audited</QPMotion>);

    const results = await runAxe(container);
    expect(results.violations).toEqual([]);
  });
});

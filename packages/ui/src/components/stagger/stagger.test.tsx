import "../../test-setup";

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "bun:test";

import { QP_STAGGER } from "../../lib/motion/motion-core.constants";
import { qpStaggerVariants } from "../../lib/motion/motion-core.utils";
import { QPMotion } from "../motion";
import { QPStagger } from "./stagger";
import { QP_STAGGER_DEFAULT } from "./stagger.constants";
import { qpStaggerTrigger } from "./stagger.utils";

afterEach(() => {
  cleanup();
});

describe("QPStagger", () => {
  test("renders its children", () => {
    const { getByText } = render(
      <QPStagger>
        <QPMotion>One</QPMotion>
        <QPMotion>Two</QPMotion>
      </QPStagger>,
    );

    expect(getByText("One")).toBeInTheDocument();
    expect(getByText("Two")).toBeInTheDocument();
  });

  test("renders the element the document needs, so a list is a real list", () => {
    const { container } = render(
      <QPStagger as="ul">
        <QPMotion as="li">One</QPMotion>
      </QPStagger>,
    );

    expect(container.querySelector('[data-slot="stagger"]')?.tagName).toBe("UL");
    expect(container.querySelector("li")).toBeInTheDocument();
  });

  test("the trigger is EITHER scroll or immediate, never both", () => {
    // Passing whileInView and animate together makes the group play twice,
    // double-firing every child.
    const immediate = qpStaggerTrigger({ whenVisible: false });
    expect(immediate).toHaveProperty("animate");
    expect(immediate).not.toHaveProperty("whileInView");

    const onScroll = qpStaggerTrigger({ whenVisible: true });
    expect(onScroll).toHaveProperty("whileInView");
    expect(onScroll).not.toHaveProperty("animate");
  });

  test("the step comes from a token and defaults to `normal`", () => {
    expect(QP_STAGGER_DEFAULT).toBe("normal");
    const variants = qpStaggerVariants({ stagger: "tight", shouldReduceMotion: false });
    expect(variants.visible).toMatchObject({
      transition: { staggerChildren: QP_STAGGER.tight },
    });
  });

  test("reduced motion collapses the step to zero — children still all appear", () => {
    // Staggering under reduce would still read as movement sweeping down the
    // page, so the sequence is removed rather than shortened.
    const variants = qpStaggerVariants({ stagger: "loose", shouldReduceMotion: true });
    expect(variants.visible).toMatchObject({ transition: { staggerChildren: 0 } });
  });

  test("reverse plays the last child first, for bottom-anchored lists", () => {
    const variants = qpStaggerVariants({ reverse: true, shouldReduceMotion: false });
    expect(variants.visible).toMatchObject({ transition: { staggerDirection: -1 } });
  });

  test("every stagger step is short enough not to outlast the reader", () => {
    // Twelve rows at 120ms each takes 1.5s, by which point the user has
    // started reading and the motion is in the way.
    for (const step of Object.values(QP_STAGGER)) {
      expect(step).toBeLessThanOrEqual(0.1);
    }
  });

  test("has no axe violations", async () => {
    const { runAxe } = await import("../../testing/axe");
    const { container } = render(
      <QPStagger as="ul">
        <QPMotion as="li">Audited</QPMotion>
      </QPStagger>,
    );

    const results = await runAxe(container);
    expect(results.violations).toEqual([]);
  });
});

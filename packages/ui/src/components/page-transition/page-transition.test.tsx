import "../../test-setup";

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "bun:test";

import { QPPageTransition } from "./page-transition";
import {
  QP_PAGE_TRANSITION_DURATION,
  QP_PAGE_TRANSITION_VARIANT,
} from "./page-transition.constants";
import { qpIsUsablePageKey } from "./page-transition.utils";

afterEach(() => {
  cleanup();
});

describe("QPPageTransition", () => {
  test("renders the page it is given", () => {
    const { getByText } = render(<QPPageTransition pageKey="/runs">Runs</QPPageTransition>);

    expect(getByText("Runs")).toBeInTheDocument();
  });

  test("defaults to the main landmark, which is what a page usually is", () => {
    const { container } = render(<QPPageTransition pageKey="/runs">Runs</QPPageTransition>);

    expect(container.querySelector('[data-slot="page-transition"]')?.tagName).toBe("MAIN");
  });

  test('mode="wait" HOLDS the outgoing page rather than swapping instantly', () => {
    const { getByText, queryByText, rerender } = render(
      <QPPageTransition pageKey="/runs">Runs</QPPageTransition>,
    );
    expect(getByText("Runs")).toBeInTheDocument();

    rerender(<QPPageTransition pageKey="/settings">Settings</QPPageTransition>);

    /*
     * The outgoing page is STILL mounted, and the incoming one is not. That is
     * the entire guarantee of `mode="wait"`: the alternative is two full pages
     * of content overlapping mid-scroll.
     *
     * The exit COMPLETING is deliberately not asserted here. Motion drives it
     * from the animation loop, which happy-dom does not run, so the swap never
     * finishes in this environment — the same class of limitation as axe's
     * colour-contrast rule. Waiting for it would hang, and asserting the
     * instant swap would assert the transition is broken. The completed
     * hand-off is verified in Storybook (Motion/QPPageTransition), where there
     * is a real animation loop and a real user can watch it.
     */
    expect(getByText("Runs")).toBeInTheDocument();
    expect(queryByText("Settings")).toBeNull();
  });

  test("an empty key is reported as unusable", () => {
    // The most common silent failure: React reuses the element unless the key
    // changes, so nothing unmounts and the exit animation never runs.
    expect(qpIsUsablePageKey("/runs")).toBe(true);
    expect(qpIsUsablePageKey("")).toBe(false);
    expect(qpIsUsablePageKey("   ")).toBe(false);
  });

  test("cross-fades rather than sliding", () => {
    // A whole page sliding implies a spatial relationship between routes that
    // a link usually does not have.
    expect(QP_PAGE_TRANSITION_VARIANT).toBe("fade");
  });

  test("runs slower than in-page motion, because a whole surface is changing", () => {
    expect(QP_PAGE_TRANSITION_DURATION).toBe("slow");
  });

  test("className merges and native props reach the element", () => {
    const { container } = render(
      <QPPageTransition pageKey="/runs" className="min-h-screen" id="page">
        Runs
      </QPPageTransition>,
    );

    expect(container.querySelector("#page")?.className).toContain("min-h-screen");
  });

  test("has no axe violations", async () => {
    const { runAxe } = await import("../../testing/axe");
    const { container } = render(<QPPageTransition pageKey="/a">Audited</QPPageTransition>);

    const results = await runAxe(container);
    expect(results.violations).toEqual([]);
  });
});

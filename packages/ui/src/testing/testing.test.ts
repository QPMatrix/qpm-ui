import "../test-setup";

import { afterEach, describe, expect, test } from "bun:test";

import { getTabbableElements } from "./a11y";
import {
  APPROVED_CONTRAST_PAIRS,
  KNOWN_CONTRAST_WAIVERS,
  compositeOver,
  contrastRatio,
  evaluateAllContrastPairs,
  parseCssColor,
} from "./contrast";
import { QP_THEME_MODES } from "../lib/theme";

// This suite exercises pure functions (contrast.ts) plus the DOM-level
// getTabbableElements helper (a11y.ts) directly against document.body — no
// React rendering is involved, so there is no `render()`/`screen` singleton
// concern here, but the file still starts with the load-bearing
// `import "../test-setup"` per this repo's convention: it is what registers
// happy-dom's `document` global that both `getTabbableElements` and the
// afterEach cleanup below depend on.
afterEach(() => {
  document.body.innerHTML = "";
});

describe("parseCssColor", () => {
  test("parses #RGB", () => {
    expect(parseCssColor("#0f0")).toEqual({ r: 0, g: 255, b: 0, a: 1 });
  });

  test("parses #RRGGBB", () => {
    expect(parseCssColor("#112233")).toEqual({ r: 17, g: 34, b: 51, a: 1 });
  });

  test("parses #RRGGBBAA", () => {
    expect(parseCssColor("#11223380")).toEqual({
      r: 17,
      g: 34,
      b: 51,
      a: 128 / 255,
    });
  });

  test("parses rgb(...)", () => {
    expect(parseCssColor("rgb(10, 20, 30)")).toEqual({ r: 10, g: 20, b: 30, a: 1 });
  });

  test("parses rgba(...)", () => {
    expect(parseCssColor("rgba(10, 20, 30, 0.5)")).toEqual({ r: 10, g: 20, b: 30, a: 0.5 });
  });

  test("returns null for a gradient", () => {
    expect(parseCssColor("linear-gradient(90deg, #000000, #ffffff)")).toBeNull();
  });
});

describe("contrastRatio", () => {
  test("black on white is 21", () => {
    const black = { r: 0, g: 0, b: 0, a: 1 };
    const white = { r: 255, g: 255, b: 255, a: 1 };
    expect(contrastRatio(black, white)).toBeCloseTo(21, 5);
  });

  test("identical colours is 1", () => {
    const grey = { r: 128, g: 128, b: 128, a: 1 };
    expect(contrastRatio(grey, grey)).toBeCloseTo(1, 10);
  });
});

describe("compositeOver", () => {
  test("an opaque source is returned unchanged", () => {
    const source = { r: 10, g: 20, b: 30, a: 1 };
    const backdrop = { r: 0, g: 0, b: 0, a: 1 };
    expect(compositeOver(source, backdrop)).toEqual(source);
  });

  test("alpha-blends a translucent source against the backdrop", () => {
    const source = { r: 255, g: 0, b: 0, a: 0.5 };
    const backdrop = { r: 0, g: 0, b: 0, a: 1 };
    const result = compositeOver(source, backdrop);
    expect(result.r).toBeCloseTo(127.5, 5);
    expect(result.g).toBeCloseTo(0, 5);
    expect(result.b).toBeCloseTo(0, 5);
    expect(result.a).toBe(1);
  });
});

describe("APPROVED_CONTRAST_PAIRS", () => {
  test("every pair either passes or is waived, in both approved modes", () => {
    const results = evaluateAllContrastPairs(QP_THEME_MODES);
    const unwaivedFailures = results
      .filter((result) => !result.passes && !result.waived)
      .map(
        (result) =>
          `${result.pair.id} (${result.mode}): ${result.ratio.toFixed(2)} < ${result.required}`,
      );
    expect(unwaivedFailures).toEqual([]);
  });

  test("no waiver is stale (its pair still actually fails)", () => {
    const results = evaluateAllContrastPairs(QP_THEME_MODES);
    const staleWaivers = results
      .filter((result) => result.waived && result.passes)
      .map(
        (result) => `${result.pair.id} (${result.mode}) now passes at ${result.ratio.toFixed(2)}`,
      );
    expect(staleWaivers).toEqual([]);
  });

  test("every waiver references a real, current pair id", () => {
    const knownIds = new Set(APPROVED_CONTRAST_PAIRS.map((pair) => pair.id));
    const orphanedWaivers = KNOWN_CONTRAST_WAIVERS.filter((waiver) => !knownIds.has(waiver.pairId));
    expect(orphanedWaivers).toEqual([]);
  });
});

describe("getTabbableElements", () => {
  test("ignores [tabindex='-1'], [disabled], and [hidden] elements", () => {
    const container = document.createElement("div");
    container.innerHTML = `
      <button id="a">A</button>
      <button id="b" tabindex="-1">B</button>
      <button id="c" disabled>C</button>
      <button id="d" hidden>D</button>
      <button id="e">E</button>
    `;
    document.body.appendChild(container);

    const ids = getTabbableElements(container).map((element) => element.id);

    expect(ids).toEqual(["a", "e"]);
  });
});

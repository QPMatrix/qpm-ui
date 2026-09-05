import { describe, expect, test } from "bun:test";

import { colorsAndGradients } from "../src/groups/colors-and-gradients";
import { elevationAndGlowShadows } from "../src/groups/elevation-and-glow-shadows";
import { motionAndZIndex } from "../src/groups/motion-and-zindex";
import { radius } from "../src/groups/radius";
import { spacingAndLayout } from "../src/groups/spacing-and-layout";
import { typography } from "../src/groups/typography";

const ALL_TS_TOKENS: Record<
  string,
  { raw: string; resolved: string; light?: { raw: string; resolved: string } }
> = {
  ...colorsAndGradients,
  ...typography,
  ...spacingAndLayout,
  ...radius,
  ...elevationAndGlowShadows,
  ...motionAndZIndex,
};

/**
 * Split a `--name:value;--name2:value2;` declaration body into a map.
 * Declarations never contain a top-level ";" inside their function-call
 * values in this source (only commas), so splitting on ";" is safe.
 */
function parseDeclarations(body: string): Record<string, string> {
  const values: Record<string, string> = {};
  for (const decl of body.split(";")) {
    const trimmed = decl.trim();
    if (!trimmed.startsWith("--")) {
      continue;
    }
    const colonIndex = trimmed.indexOf(":");
    const name = trimmed.slice(2, colonIndex).trim();
    const value = trimmed.slice(colonIndex + 1).trim();
    values[name] = value;
  }
  return values;
}

/**
 * Parse the shipped tokens.css into { name: rawValue } maps for the dark
 * (default :root, merged across all six blocks) and light
 * ([data-theme="light"]) declarations.
 */
function parseCss(css: string) {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");

  const dark: Record<string, string> = {};
  const rootBlockRegex = /:root\{([^}]*)\}/g;
  let rootMatch = rootBlockRegex.exec(withoutComments);
  while (rootMatch !== null) {
    Object.assign(dark, parseDeclarations(rootMatch[1] ?? ""));
    rootMatch = rootBlockRegex.exec(withoutComments);
  }

  const lightBlockRegex = /\[data-theme="light"\]\{([^}]*)\}/;
  const lightMatch = lightBlockRegex.exec(withoutComments);
  const light = parseDeclarations(lightMatch?.[1] ?? "");

  return { dark, light };
}

describe("tokens.css has no drift from the TS token objects", () => {
  test("every TS token's raw value matches its CSS declaration", async () => {
    const cssPath = Bun.resolveSync("../tokens.css", import.meta.dir);
    const css = await Bun.file(cssPath).text();
    const { dark, light } = parseCss(css);

    expect(Object.keys(dark).length).toBe(246);
    expect(Object.keys(light).length).toBe(41);

    for (const [name, token] of Object.entries(ALL_TS_TOKENS)) {
      expect(dark[name]).toBe(token.raw);

      if (token.light) {
        expect(light[name]).toBe(token.light.raw);
      } else {
        expect(light[name]).toBeUndefined();
      }
    }

    // and the reverse direction: every CSS declaration is represented in TS
    for (const name of Object.keys(dark)) {
      expect(ALL_TS_TOKENS[name]).toBeDefined();
    }
  });

  test("qp-* keyframes and reduced-motion guard are present verbatim", async () => {
    const cssPath = Bun.resolveSync("../tokens.css", import.meta.dir);
    const css = await Bun.file(cssPath).text();

    for (const keyframe of [
      "qp-pulse",
      "qp-halo",
      "qp-flow",
      "qp-sweep",
      "qp-breathe",
      "qp-orbit",
      "qp-rise",
      "qp-shimmer",
      "qp-scan",
    ]) {
      expect(css).toContain(`@keyframes ${keyframe}{`);
    }

    for (const utilityClass of [
      "qp-anim-rise",
      "qp-anim-pulse",
      "qp-anim-breathe",
      "qp-anim-orbit",
      "qp-anim-flow",
    ]) {
      expect(css).toContain(`.${utilityClass}{`);
    }

    expect(css).toContain("@media (prefers-reduced-motion:reduce){");
    expect(css).toContain("animation-duration:.01ms!important");
  });
});

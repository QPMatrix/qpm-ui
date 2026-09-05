import { describe, expect, test } from "bun:test";

import { colorsAndGradients } from "../src/groups/colors-and-gradients";
import { elevationAndGlowShadows } from "../src/groups/elevation-and-glow-shadows";
import { motionAndZIndex } from "../src/groups/motion-and-zindex";
import { radius } from "../src/groups/radius";
import { spacingAndLayout } from "../src/groups/spacing-and-layout";
import { typography } from "../src/groups/typography";
import { cssVar } from "../src/css-var";
import fixture from "./fixtures/tokens.json";

const GROUPS: Record<string, Record<string, unknown>> = {
  "colors-and-gradients": colorsAndGradients,
  typography,
  "spacing-and-layout": spacingAndLayout,
  radius,
  "elevation-and-glow-shadows": elevationAndGlowShadows,
  "motion-and-zindex": motionAndZIndex,
};

interface FixtureToken {
  raw: string;
  resolved: string;
  light_raw?: string;
  light_resolved?: string;
  used_by_component_bundle: boolean;
}

describe("token values match tokens.json source (byte-exact)", () => {
  const fixtureGroups = fixture.groups as Record<string, Record<string, FixtureToken>>;

  for (const [groupName, fixtureTokens] of Object.entries(fixtureGroups)) {
    describe(groupName, () => {
      const group = GROUPS[groupName];

      test("group exists in TS exports", () => {
        expect(group).toBeDefined();
      });

      for (const [cssName, expected] of Object.entries(fixtureTokens)) {
        const name = cssName.slice(2); // strip leading --

        test(`"${name}" matches source raw/resolved/light/usedByComponentBundle`, () => {
          const actual = group?.[name] as
            | {
                raw: string;
                resolved: string;
                light?: { raw: string; resolved: string };
                usedByComponentBundle: boolean;
              }
            | undefined;

          expect(actual).toBeDefined();
          expect(actual?.raw).toBe(expected.raw);
          expect(actual?.resolved).toBe(expected.resolved);
          expect(actual?.usedByComponentBundle).toBe(expected.used_by_component_bundle);

          if (expected.light_raw !== undefined) {
            expect(actual?.light).toBeDefined();
            expect(actual?.light?.raw).toBe(expected.light_raw);
            expect(actual?.light?.resolved).toBe(expected.light_resolved);
          } else {
            expect(actual?.light).toBeUndefined();
          }
        });
      }
    });
  }
});

describe("token counts match the design source", () => {
  test("246 total dark tokens across all groups", () => {
    const total = Object.values(GROUPS).reduce((sum, group) => sum + Object.keys(group).length, 0);
    expect(total).toBe(246);
    expect(total).toBe(fixture._meta.total_dark_tokens);
  });

  test("41 light-theme overrides, all in colors-and-gradients", () => {
    const lightCount = Object.values(colorsAndGradients).filter((t) => "light" in t).length;
    expect(lightCount).toBe(41);
    expect(lightCount).toBe(fixture._meta.total_light_overrides);

    for (const [group, tokens] of Object.entries(GROUPS)) {
      if (group === "colors-and-gradients") {
        continue;
      }
      const withLight = Object.values(tokens).filter((t) => "light" in (t as object));
      expect(withLight.length).toBe(0);
    }
  });
});

describe("cssVar helper", () => {
  test("wraps a known token name in var(--...)", () => {
    expect(cssVar("bg-canvas")).toBe("var(--bg-canvas)");
    expect(cssVar("brand-primary")).toBe("var(--brand-primary)");
    expect(cssVar("space-4")).toBe("var(--space-4)");
    expect(cssVar("radius-md")).toBe("var(--radius-md)");
    expect(cssVar("duration-fast")).toBe("var(--duration-fast)");
    expect(cssVar("elevation-raised")).toBe("var(--elevation-raised)");
  });
});

describe("package exports map", () => {
  test("'.' resolves to the token barrel", async () => {
    const pkg = await import("@qpmtx/tokens");
    expect(pkg.colorsAndGradients).toBeDefined();
    expect(pkg.typography).toBeDefined();
    expect(pkg.spacingAndLayout).toBeDefined();
    expect(pkg.radius).toBeDefined();
    expect(pkg.elevationAndGlowShadows).toBeDefined();
    expect(pkg.motionAndZIndex).toBeDefined();
    expect(typeof pkg.cssVar).toBe("function");
  });

  test("'./css' resolves to a readable tokens.css file", async () => {
    const resolved = Bun.resolveSync("@qpmtx/tokens/css", import.meta.dir);
    expect(resolved.endsWith("tokens.css")).toBe(true);
    const text = await Bun.file(resolved).text();
    expect(text).toContain(":root{");
    expect(text.length).toBeGreaterThan(1000);
  });
});

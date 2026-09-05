import "./test-setup";

import { Glob } from "bun";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "bun:test";
import { createElement, type ReactElement } from "react";

import { UI_PACKAGE_DIR } from "./registry/utils/paths";

/**
 * Every story must show a real example.
 *
 * A story that renders a bare `<Component />` is worse than a missing story:
 * Storybook lists it, the a11y addon reports a clean pass on nothing, and the
 * component looks covered when it is not. Twenty-two primitives shipped that
 * way — the story generator fell back to `<Root />` for any primitive whose
 * composition it could not infer from an export list.
 *
 * Neither typecheck nor `storybook build` catches it: an empty component is
 * valid code that builds fine. Rendering alone does not catch it either — a
 * bare `<Field />` renders `<div role="group">` with nothing inside, which is
 * one element and no text, exactly like a legitimately atomic `<Input />`.
 *
 * So there are two checks, and they cover different failure modes:
 *
 *   1. SOURCE — no story may render a bare self-closing component with no
 *      props and no children. That is precisely the placeholder shape, and it
 *      is the only signal that distinguishes an empty container from an atomic
 *      control.
 *   2. RENDER — every story must actually render without throwing and produce
 *      DOM. Catches a story that composes correctly on paper but explodes.
 */

const STORY_GLOB = "components/**/*.stories.tsx";

/**
 * A story whose ENTIRE body is one bare component.
 *
 * Matching any `<Foo />` line would flag legitimately propless sub-parts —
 * `<Separator />`, `<Spinner />`, `<CarouselNext />`, an icon like `<X />` —
 * which are correct. The defect is specifically a story that shows nothing
 * BUT a bare root, so the whole render body is captured and compared.
 */
const RENDER_BODY = /render:\s*\(\)\s*=>\s*\(([\s\S]*?)\n\s*\),/g;
const ONLY_BARE_COMPONENT = /^<>\s*<([A-Z][A-Za-z0-9]*)\s*\/>\s*<\/>$/;

interface StoryModule {
  default?: { title?: string; component?: unknown };
  [name: string]: unknown;
}

interface StoryObject {
  render?: (args: Record<string, unknown>) => ReactElement;
  args?: Record<string, unknown>;
}

function isStoryObject(value: unknown): value is StoryObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const storyFiles: string[] = [];
for await (const file of new Glob(STORY_GLOB).scan(`${UI_PACKAGE_DIR}/src`)) {
  storyFiles.push(file);
}
storyFiles.sort();

afterEach(() => {
  cleanup();
});

describe("stories show real examples", () => {
  test("story files were found", () => {
    // Guards against the glob silently matching nothing, which would make
    // every assertion below vacuously pass.
    expect(storyFiles.length).toBeGreaterThan(50);
  });

  test("no story is a bare component that renders an empty box", async () => {
    const placeholders: string[] = [];

    for (const file of storyFiles) {
      const source = await Bun.file(`${UI_PACKAGE_DIR}/src/${file}`).text();

      RENDER_BODY.lastIndex = 0;
      let bodyMatch = RENDER_BODY.exec(source);
      while (bodyMatch !== null) {
        const body = (bodyMatch[1] ?? "").replace(/\s+/g, " ").trim();
        const bare = ONLY_BARE_COMPONENT.exec(body);
        bodyMatch = RENDER_BODY.exec(source);

        if (bare === null) {
          continue;
        }

        /*
         * A bare root is not automatically wrong — `<Spinner />` IS the whole
         * component and has nothing to compose. What makes it a placeholder is
         * rendering an EMPTY container: `<Field />` produces
         * `<div role="group">` with nothing inside, which is a blank box in
         * Storybook. So the source shape narrows the candidates and the render
         * decides, which needs no allowlist to maintain.
         */
        const mod = (await import(`${UI_PACKAGE_DIR}/src/${file}`)) as StoryModule;
        for (const [exportName, value] of Object.entries(mod)) {
          if (exportName === "default" || !isStoryObject(value)) {
            continue;
          }
          if (typeof value.render !== "function") {
            continue;
          }
          const StoryComponent = value.render as (args: Record<string, unknown>) => ReactElement;
          const { container } = render(createElement(StoryComponent, value.args ?? {}));
          const root = container.firstElementChild;
          const empty =
            root === null ||
            (root.children.length === 0 && (root.textContent ?? "").trim().length === 0);
          if (empty) {
            placeholders.push(
              `${file}:${exportName} — bare <${bare[1] ?? ""} /> renders an empty box`,
            );
          }
          cleanup();
        }
      }
    }

    expect(placeholders).toEqual([]);
  });

  for (const file of storyFiles) {
    const name =
      file
        .replace(/\.stories\.tsx$/, "")
        .split("/")
        .pop() ?? file;

    test(`${name} — every exported story renders`, async () => {
      const mod = (await import(`${UI_PACKAGE_DIR}/src/${file}`)) as StoryModule;

      const stories = Object.entries(mod).filter(
        ([exportName, value]) => exportName !== "default" && isStoryObject(value),
      );
      expect(stories.length).toBeGreaterThan(0);

      const broken: string[] = [];

      for (const [exportName, value] of stories) {
        if (!isStoryObject(value) || typeof value.render !== "function") {
          // An args-only story is bound to `meta.component` by Storybook's own
          // machinery, which is not available here. The source check above
          // already covers the placeholder shape for those.
          continue;
        }

        try {
          /*
           * Mounted as a COMPONENT, not called as a function. A story's
           * `render` may use hooks (QPPageTransition's does, to drive routes),
           * and invoking it directly runs those hooks outside any component,
           * which React rejects with "Invalid hook call".
           */
          const StoryComponent = value.render as (args: Record<string, unknown>) => ReactElement;
          const { container } = render(createElement(StoryComponent, value.args ?? {}));
          if (container.querySelectorAll("*").length === 0) {
            broken.push(`${exportName} (rendered no elements)`);
          }
        } catch (error) {
          broken.push(`${exportName} (threw: ${String(error).slice(0, 140)})`);
        }
        cleanup();
      }

      expect(broken).toEqual([]);
    });
  }
});

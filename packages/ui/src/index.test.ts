import { Glob } from "bun";
import { describe, expect, test } from "bun:test";

import { UI_PACKAGE_DIR } from "./registry/utils/paths";

/**
 * The PUBLIC API contract.
 *
 * `src/index.ts` is the only module apps import from, so a component missing
 * from it does not exist as far as npm consumers are concerned — and nothing
 * else in this repo notices. Typecheck passes (the component compiles), lint
 * passes (it is valid code), every component test passes (they import the file
 * directly), and the registry validates (it tracks files, not exports).
 *
 * That gap is not hypothetical: regenerating the barrel from a hardcoded
 * folder list silently dropped nine components — the entire typography, layout,
 * content and motion surface — and the full `bun run check` stayed green. It
 * was caught only by importing the built `dist/` and diffing its exports.
 *
 * These tests close that hole by deriving the expectation from DISK, so adding
 * a component folder without exporting it is a failing test rather than a
 * silently broken release.
 */

const COMPONENTS_DIR = `${UI_PACKAGE_DIR}/src/components`;

async function componentFolders(): Promise<string[]> {
  const folders: string[] = [];
  for await (const entry of new Glob("*/").scan({ cwd: COMPONENTS_DIR, onlyFiles: false })) {
    const name = entry.replace(/\/$/, "");
    // `ui/` holds the shadcn primitives — flat files, re-exported individually
    // with QP aliases rather than through a folder barrel.
    if (name !== "" && name !== "ui") {
      folders.push(name);
    }
  }
  return folders.sort();
}

describe("public barrel — every component reaches consumers", () => {
  test("src/index.ts exports every component folder on disk", async () => {
    const source = await Bun.file(`${UI_PACKAGE_DIR}/src/index.ts`).text();
    const folders = await componentFolders();

    const missing = folders.filter(
      (name) => !source.includes(`export * from "./components/${name}"`),
    );

    expect(missing).toEqual([]);
    expect(folders.length).toBeGreaterThan(0);
  });

  test("every shadcn primitive is re-exported under a QP name", async () => {
    const source = await Bun.file(`${UI_PACKAGE_DIR}/src/index.ts`).text();

    const primitives: string[] = [];
    for await (const file of new Glob("*.tsx").scan(`${COMPONENTS_DIR}/ui`)) {
      if (!file.endsWith(".test.tsx") && !file.endsWith(".stories.tsx")) {
        primitives.push(file.replace(/\.tsx$/, ""));
      }
    }

    const missing = primitives
      .sort()
      .filter((name) => !source.includes(`from "./components/ui/${name}"`));

    expect(missing).toEqual([]);
  });

  test("the motion foundation is exported as library infrastructure", async () => {
    const source = await Bun.file(`${UI_PACKAGE_DIR}/src/index.ts`).text();

    expect(source).toContain('from "./lib/motion"');
    expect(source).toContain('from "./lib/utils"');
  });
});

describe("public API surface", () => {
  /*
   * Imports the barrel itself rather than reading it as text, so these assert
   * what a consumer actually receives — including anything a nested `export *`
   * pulls in without naming.
   */
  test("every capitalised export is QP-prefixed", async () => {
    const api: Record<string, unknown> = await import("./index");

    const unprefixed = Object.keys(api)
      .filter((name) => /^[A-Z]/.test(name) && !name.startsWith("QP"))
      .sort();

    // The prefix is the whole point of the naming rule: an app importing from
    // a dozen packages must never wonder whose `Button` it just got.
    expect(unprefixed).toEqual([]);
  });

  test("every lowercase export is qp-prefixed, or a documented library helper", async () => {
    const api: Record<string, unknown> = await import("./index");

    // `cn` and `isRenderable` predate the prefix rule and are deliberately
    // unprefixed: they are the shadcn-conventional names, and `cn` in
    // particular appears in every copied component's source.
    const allowed = new Set([
      "cn",
      "isRenderable",
      "themeAttributes",
      "resolveThemeSelection",
      "isApprovedThemeSelection",
    ]);

    /*
     * Hooks carry the prefix as an INFIX: `useQPReducedMotion`, not
     * `qpUseReducedMotion`. React's rules-of-hooks lint identifies a hook by a
     * leading `use`, so moving the prefix in front would break it — and a hook
     * the linter cannot see is a hook whose dependency arrays go unchecked.
     */
    const unexpected = Object.keys(api)
      .filter(
        (name) =>
          /^[a-z]/.test(name) &&
          !name.startsWith("qp") &&
          !/^use[A-Z]/.test(name) &&
          !allowed.has(name),
      )
      .sort();

    expect(unexpected).toEqual([]);
  });

  test("the components a consumer is most likely to reach for are all present", async () => {
    const api: Record<string, unknown> = await import("./index");

    // A spot list across every surface, so a whole area cannot vanish the way
    // typography, layout, content and motion just did.
    for (const name of [
      "QPButton",
      "QPTable",
      "QPDialog",
      "QPText",
      "QPHeading",
      "QPSection",
      "QPPageContainer",
      "QPProse",
      "QPMotion",
      "QPReveal",
      "QPStagger",
      "QPPageTransition",
      "QPMetricCard",
      "QPChatPanel",
      "QPComposer",
      "QPIconButton",
      "qpMdxComponents",
      "QP_VARIANTS",
      "QP_DURATION",
      "cn",
    ]) {
      expect(api).toHaveProperty(name);
    }
  });
});

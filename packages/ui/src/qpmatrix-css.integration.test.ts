import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import tailwindcss from "@tailwindcss/vite";
import { build } from "vite";

import { UI_PACKAGE_DIR } from "./registry/utils/paths";

/**
 * Integration coverage for QPMSEC-787's `@source` line in
 * `styles/qpmatrix.css`.
 *
 * The bug this pins: Tailwind v4's automatic source detection ignores
 * `node_modules`, so a consumer that did nothing but
 * `@import "@qpmtx/ui/css"` got NONE of the utility classes this package's
 * own components spell in their own markup — `max-w-5xl`, `rounded-xl`,
 * `bg-card`, the whole type ramp. The consumer had to add an `@source` line
 * of their own to fix it. The fix here moves that line into
 * `styles/qpmatrix.css` itself, so a consumer needs nothing extra.
 *
 * Every other gate stays green without this: typecheck, lint and `bun test`
 * elsewhere in this package assert nothing about the classes Tailwind
 * actually GENERATES, only about the source code. Proving the promise
 * ("nothing added on the consumer's side") requires actually running a real
 * Tailwind build against a real consumer, which is what this test does:
 *
 *   1. A throwaway fixture directory, symlinked into `node_modules/@qpmtx/ui`
 *      the way a real install would be — not a relative path into this
 *      package, because the whole point is proving resolution through the
 *      package's own published entry point (`exports["./css"]`).
 *   2. One CSS file in that fixture containing ONLY
 *      `@import "@qpmtx/ui/css";` — no other source file spells any
 *      QPMatrix utility class, so any kit class present in the build output
 *      can only have arrived through `@qpmtx/ui`'s OWN `@source` declaration.
 *   3. A real `vite build` with the real `@tailwindcss/vite` plugin (both
 *      already devDependencies of this package — no dependency added for
 *      this test), asserting the generated CSS contains a class this
 *      package's `QPPageContainer` emits and nothing in the fixture spells.
 *
 * `ensure_build` (the repo's `./check` gate) runs `bun run build` before
 * `bun run test`, so `packages/ui/dist` — the directory the `@source` line
 * names — always exists by the time this test runs.
 */

const KIT_ONLY_CLASS = "max-w-5xl"; // QP_PAGE_WIDTH_CLASSES.content — QPPageContainer, page-container.constants.ts

async function buildFixtureCss(fixtureDir: string): Promise<string> {
  mkdirSync(join(fixtureDir, "node_modules", "@qpmtx"), { recursive: true });
  symlinkSync(UI_PACKAGE_DIR, join(fixtureDir, "node_modules", "@qpmtx", "ui"), "dir");

  const entryPath = join(fixtureDir, "entry.css");
  writeFileSync(entryPath, '@import "@qpmtx/ui/css";\n', "utf8");

  const result = await build({
    root: fixtureDir,
    logLevel: "silent",
    plugins: [tailwindcss()],
    build: {
      write: false,
      cssMinify: false,
      rolldownOptions: { input: entryPath },
    },
  });

  const outputs = Array.isArray(result) ? result : [result];
  for (const bundle of outputs) {
    if (!("output" in bundle)) {
      continue;
    }
    for (const chunk of bundle.output) {
      if (chunk.type === "asset" && chunk.fileName.endsWith(".css")) {
        return typeof chunk.source === "string" ? chunk.source : chunk.source.toString();
      }
    }
  }
  throw new Error("Expected the fixture build to emit a CSS asset — got none.");
}

describe("styles/qpmatrix.css — the kit's own Tailwind @source", () => {
  test('a consumer that only does `@import "@qpmtx/ui/css"` gets the kit\'s utility classes, with nothing added on their side', async () => {
    const fixtureDir = mkdtempSync(join(tmpdir(), "qpmtx-ui-css-source-"));
    try {
      const css = await buildFixtureCss(fixtureDir);

      // The fixture directory spells no QPMatrix class of its own — the
      // ONLY way this class reaches the output is through @qpmtx/ui's own
      // `@source` declaration resolving into its `dist/`.
      expect(css).toContain(KIT_ONLY_CLASS);
    } finally {
      rmSync(fixtureDir, { recursive: true, force: true });
    }
  }, 30_000);

  test("still imports the tokens the utilities resolve against, not just the utilities themselves", async () => {
    const fixtureDir = mkdtempSync(join(tmpdir(), "qpmtx-ui-css-source-"));
    try {
      const css = await buildFixtureCss(fixtureDir);

      // A utility class with no token behind it is a broken component: prove
      // the adapter's own role variables made it through too.
      expect(css).toContain("--background");
      expect(css).toContain("--radius");
    } finally {
      rmSync(fixtureDir, { recursive: true, force: true });
    }
  }, 30_000);
});

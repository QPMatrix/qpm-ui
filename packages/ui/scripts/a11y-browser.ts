#!/usr/bin/env bun
/**
 * a11y-browser — serve the built Storybook with a real-browser axe sweep.
 *
 * `bun run a11y:audit` renders components into happy-dom, which has no layout
 * engine and no compositing, so axe's `color-contrast` rule always returns
 * `incomplete` there. `bun run a11y:contrast` covers colour at the TOKEN
 * layer, but only for combinations somebody remembered to declare.
 *
 * Between them sits a real gap, and it is not theoretical. Running this sweep
 * found four defects every other gate passed:
 *
 *   - the default Button, the Composer's submit control and every user message
 *     bubble rendered body text on `brand-primary` at 4.04:1;
 *   - the brand-tinted ProductBadge rendered at 4.23:1.
 *
 * All four involved a colour that exists only once rendered — a Tailwind alpha
 * modifier, or a translucent token composited over the canvas — which is
 * precisely what a DOM without compositing cannot see.
 *
 * This copies the sweep harness into the build output and serves it. Open the
 * printed URL; the page walks every story, injects axe into each story frame,
 * and prints a summary grouped by failing colour pair.
 *
 * Usage:
 *   bun run a11y:browser              # build if needed, then serve
 *   bun run a11y:browser -- --build   # force a rebuild first
 */

import { existsSync } from "node:fs";
import { copyFile, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const UI_DIR = resolve(import.meta.dir, "..");
const STATIC_DIR = join(UI_DIR, "storybook-static");
const HARNESS = join(import.meta.dir, "browser", "a11y-sweep.html");

const argv = process.argv.slice(2);

function parsePort(): number {
  const index = argv.indexOf("--port");
  if (index === -1) {
    return 6008;
  }
  const value = Number(argv[index + 1]);
  return Number.isInteger(value) && value > 0 && value < 65536 ? value : 6008;
}

if (argv.includes("--build") || !existsSync(join(STATIC_DIR, "index.json"))) {
  console.log("building Storybook…");
  const build = Bun.spawnSync({
    cmd: ["bun", "run", "storybook:build"],
    cwd: UI_DIR,
    stdout: "inherit",
    stderr: "inherit",
  });
  if (build.exitCode !== 0) {
    console.error("storybook build failed; not sweeping a half-built preview.");
    process.exit(build.exitCode ?? 1);
  }
}

await mkdir(STATIC_DIR, { recursive: true });

/*
 * Both files are copied on EVERY run, because `storybook build` wipes its
 * output directory — a harness written there by hand survives exactly until
 * the next build, which is how the first version of this sweep silently
 * disappeared mid-investigation.
 */
await copyFile(HARNESS, join(STATIC_DIR, "a11y-sweep.html"));

const axeSource = [
  join(UI_DIR, "node_modules", "axe-core", "axe.min.js"),
  join(UI_DIR, "..", "..", "node_modules", "axe-core", "axe.min.js"),
].find((candidate) => existsSync(candidate));

if (axeSource === undefined) {
  console.error(
    "Could not find axe-core/axe.min.js. Run `bun install` — axe-core is a devDependency of @qpmtx/ui.",
  );
  process.exit(1);
}
await copyFile(axeSource, join(STATIC_DIR, "axe.min.js"));

const port = parsePort();

const server = Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);
    const decoded = decodeURIComponent(url.pathname);
    const candidate = join(STATIC_DIR, decoded === "/" ? "/index.html" : decoded);

    // `normalize` is applied by `join`; the prefix check stops a crafted path
    // escaping the build output.
    if (!candidate.startsWith(STATIC_DIR)) {
      return new Response("Forbidden", { status: 403 });
    }

    const file = Bun.file(candidate);
    if (await file.exists()) {
      return new Response(file);
    }
    return new Response(Bun.file(join(STATIC_DIR, "index.html")), {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  },
});

console.log(`
a11y browser sweep  http://localhost:${String(server.port)}/a11y-sweep.html

Open it. The page walks every story, injects axe into each story frame, and
prints a summary grouped by failing colour pair. Roughly one story per second.

This covers what happy-dom cannot: colour contrast as actually rendered and
composited. Structural rules are already covered by \`bun run a11y:audit\`.
`);

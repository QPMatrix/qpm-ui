#!/usr/bin/env bun
/**
 * preview-storybook — serve the BUILT Storybook.
 *
 * `bun run storybook` is the authoring loop: Vite dev server, HMR, slow first
 * boot, and it recompiles on every keystroke. That is the wrong thing to hand
 * someone for review, and the wrong thing to point CI at.
 *
 * This serves `storybook-static/` — the same artefact `storybook:build`
 * produces and the same one that would be deployed — over a plain static
 * server. It builds first if the output is missing or `--build` is passed, so
 * "show me the component library" is one command with no prior state.
 *
 * Usage:
 *   bun run storybook:preview                # build if needed, then serve :6007
 *   bun run storybook:preview -- --build     # force a rebuild first
 *   bun run storybook:preview -- --port 8080
 */

import { existsSync } from "node:fs";
import { join, normalize, resolve } from "node:path";

const UI_DIR = resolve(import.meta.dir, "..");
const STATIC_DIR = join(UI_DIR, "storybook-static");

const argv = process.argv.slice(2);

function parsePort(): number {
  const index = argv.indexOf("--port");
  if (index === -1) {
    return 6007;
  }
  const value = Number(argv[index + 1]);
  return Number.isInteger(value) && value > 0 && value < 65536 ? value : 6007;
}

const needsBuild = argv.includes("--build") || !existsSync(join(STATIC_DIR, "index.html"));

if (needsBuild) {
  console.log("storybook-static is missing or stale — building…");
  const build = Bun.spawnSync({
    cmd: ["bun", "run", "storybook:build"],
    cwd: UI_DIR,
    stdout: "inherit",
    stderr: "inherit",
  });
  if (build.exitCode !== 0) {
    console.error("storybook build failed; not serving a half-built preview.");
    process.exit(build.exitCode ?? 1);
  }
}

const port = parsePort();

const server = Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);
    const decoded = decodeURIComponent(url.pathname);

    // `normalize` collapses `..` before the prefix check, so a crafted path
    // cannot escape storybook-static and read arbitrary files off disk.
    const candidate = normalize(join(STATIC_DIR, decoded === "/" ? "/index.html" : decoded));
    if (!candidate.startsWith(STATIC_DIR)) {
      return new Response("Forbidden", { status: 403 });
    }

    const direct = Bun.file(candidate);
    if (await direct.exists()) {
      return new Response(direct);
    }

    // Storybook 10 routes client-side; unknown paths fall back to the shell
    // rather than 404ing, which is what a deep link to a story needs.
    const shell = Bun.file(join(STATIC_DIR, "index.html"));
    if (await shell.exists()) {
      return new Response(shell, { headers: { "content-type": "text/html; charset=utf-8" } });
    }
    return new Response("Not found", { status: 404 });
  },
});

console.log(`storybook preview  http://localhost:${String(server.port)}`);

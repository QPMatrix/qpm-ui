#!/usr/bin/env bun
/**
 * preview-registry — browse what @qpmatrix/ui actually distributes.
 *
 * `registry:validate` tells you the registry is *consistent*. It cannot tell
 * you whether it is *right*: whether an item's accessibility status is honest,
 * whether a component you are about to write already exists, which tokens a
 * consumer inherits by installing it, or what the install command is. Those are
 * reading tasks, and reading 25 TypeScript item files to answer them is how
 * duplicate components get written.
 *
 * This serves the canonical registry as a searchable page: every item with its
 * type, version, files, npm dependencies, registry dependencies, token
 * dependencies, accessibility block and copy-pasteable install command.
 *
 * It reads `QP_REGISTRY_ITEMS` directly — the same array `registry:build`
 * projects into `registry.json` — so the preview cannot drift from the source
 * of truth by being stale. Nothing is written to disk.
 *
 * It is also a REAL, INSTALLABLE shadcn registry, not just a viewer. It serves
 * per-item JSON at `/r/{name}.json` with each file's content inlined, which is
 * the shape the shadcn CLI fetches from a hosted registry. So an app can point
 * `components.json` at it and run `shadcn add` against a working copy:
 *
 *   // the consuming app's components.json
 *   "registries": { "@qp": "http://localhost:4321/r/{name}.json" }
 *
 *   bunx shadcn@latest add @qp/metric-card
 *
 * That makes the install path testable end-to-end before publishing, instead of
 * being discovered broken by the first consumer.
 *
 * Usage:
 *   bun run registry:preview               # serve on :4321
 *   bun run registry:preview -- --port 5000
 *   bun run registry:preview -- --json     # print the projected shadcn manifest
 */

import { QP_REGISTRY_ITEMS } from "../src/registry/items/index";
import { UI_PACKAGE_PREFIX, absolutePathFor } from "../src/registry/utils/paths";
import {
  QP_GITHUB_REGISTRY,
  flattenRelativeImports,
  projectItem,
  projectRegistry,
} from "../src/registry/utils/project-shadcn";
import { knownDefectsOf, type QpRegistryItem } from "../src/registry/schemas/registry-item.schema";

const REGISTRY_NAME = "@qpmatrix/ui";
const REGISTRY_HOMEPAGE = "https://github.com/QPMatrix/qpm-ui";

/**
 * The namespace to serve local dependencies under, e.g. `--namespace @qp`.
 *
 * Without it the payload's `registryDependencies` point at the GitHub address,
 * so a CLI installing from this server would fetch the item from localhost and
 * its dependencies from GitHub — a half-local install that works right up until
 * the two disagree.
 */
function parseNamespace(argv: string[]): string | undefined {
  const index = argv.indexOf("--namespace");
  if (index === -1) {
    return undefined;
  }
  const value = argv[index + 1];
  return value === undefined || value.startsWith("--") ? undefined : value;
}

function parsePort(argv: string[]): number {
  const index = argv.indexOf("--port");
  if (index === -1) {
    return 4321;
  }
  const value = Number(argv[index + 1]);
  return Number.isInteger(value) && value > 0 && value < 65536 ? value : 4321;
}

/**
 * Minimal HTML escaping for the four characters that can break out of text or
 * attribute context. Registry item strings are repo-authored, not user input,
 * but a description containing `<` would silently corrupt the page.
 */
function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function chips(label: string, values: readonly string[], variant: string): string {
  if (values.length === 0) {
    return "";
  }
  return `<div class="row"><span class="row-label">${escapeHtml(label)}</span><span class="chips">${values
    .map((value) => `<code class="chip ${variant}">${escapeHtml(value)}</code>`)
    .join("")}</span></div>`;
}

function accessibilityBadge(item: QpRegistryItem): string {
  const { status, interactive, keyboardTested, focusManaged } = item.accessibility;
  const facts = [
    interactive ? "interactive" : "static",
    keyboardTested ? "keyboard-tested" : "keyboard-untested",
    focusManaged ? "focus-managed" : null,
  ].filter((fact): fact is string => fact !== null);

  /*
   * A recorded WCAG failure is the single most important thing on the card, so
   * it is rendered as its own badge rather than buried in the notes tooltip
   * where nobody scanning the grid would see it.
   */
  const defects = knownDefectsOf(item.accessibility)
    .map(
      (defect) =>
        `<span class="badge a11y-defect" title="${escapeHtml(
          `${defect.summary} — owned by ${defect.owner}`,
        )}">fails SC ${escapeHtml(defect.criterion)}</span>`,
    )
    .join("");

  return `<span class="badge a11y-${escapeHtml(status)}" title="${escapeHtml(
    item.accessibility.notes ?? "",
  )}">${escapeHtml(status)} · ${escapeHtml(item.accessibility.wcagLevel)}</span>${defects}
    <span class="facts">${facts.map((fact) => escapeHtml(fact)).join(" · ")}</span>`;
}

function renderItem(item: QpRegistryItem): string {
  const install = `bunx --bun shadcn@latest add ${QP_GITHUB_REGISTRY}/${item.name}`;
  const searchKey = [item.name, item.type, item.description, ...item.tags].join(" ").toLowerCase();

  return `<article class="item" data-search="${escapeHtml(searchKey)}" data-type="${escapeHtml(
    item.type,
  )}" data-a11y="${escapeHtml(item.accessibility.status)}">
  <header>
    <h2>${escapeHtml(item.name)}</h2>
    <span class="badge type">${escapeHtml(item.type)}</span>
    <span class="badge version">v${escapeHtml(item.version)}</span>
    ${accessibilityBadge(item)}
  </header>
  <p class="description">${escapeHtml(item.description)}</p>
  <div class="install"><code>${escapeHtml(install)}</code></div>
  ${chips(
    "files",
    item.files.map((file) => file.path),
    "path",
  )}
  ${chips("npm", item.dependencies, "dep")}
  ${chips("registry", item.registryDependencies, "dep")}
  ${chips("tokens", item.tokenDependencies, "token")}
  ${chips("platforms", item.supportedPlatforms, "plain")}
  ${chips("tags", item.tags, "plain")}
  ${
    item.accessibility.notes === undefined
      ? ""
      : `<p class="notes">${escapeHtml(item.accessibility.notes)}</p>`
  }
</article>`;
}

function renderPage(items: readonly QpRegistryItem[]): string {
  const types = [...new Set(items.map((item) => item.type))].sort();
  const byStatus = items.reduce<Record<string, number>>((acc, item) => {
    const key = item.accessibility.status;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return `<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(REGISTRY_NAME)} — registry preview</title>
<style>
  :root { color-scheme: dark; --bg:#0b0d10; --fg:#e6e8eb; --muted:#8b929c; --surface:#14171c;
          --border:#242a32; --accent:#7c8cff; --ok:#3fb27f; --warn:#d9a441; --bad:#e5484d;
          --off:#6b7280; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--fg); font:14px/1.55 ui-sans-serif,system-ui,sans-serif; }
  header.page { padding:2rem 1.5rem 1rem; border-bottom:1px solid var(--border); position:sticky; top:0; background:var(--bg); z-index:2; }
  h1 { margin:0 0 .35rem; font-size:1.15rem; font-weight:600; }
  .sub { color:var(--muted); margin:0 0 1rem; }
  .controls { display:flex; gap:.5rem; flex-wrap:wrap; }
  input, select { background:var(--surface); color:var(--fg); border:1px solid var(--border);
                  border-radius:8px; padding:.5rem .7rem; font:inherit; }
  input { flex:1 1 18rem; }
  main { padding:1.25rem 1.5rem 4rem; display:grid; gap:1rem;
         grid-template-columns:repeat(auto-fill,minmax(min(100%,30rem),1fr)); }
  .item { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:1rem 1.1rem; }
  .item[hidden] { display:none; }
  .item header { display:flex; align-items:center; gap:.5rem; flex-wrap:wrap; margin-bottom:.5rem; }
  h2 { margin:0; font-size:1rem; font-weight:600; font-family:ui-monospace,monospace; }
  .badge { font-size:.7rem; padding:.12rem .45rem; border-radius:999px; border:1px solid var(--border); color:var(--muted); }
  .badge.type { color:var(--accent); border-color:var(--accent); }
  .a11y-audited { color:var(--ok); border-color:var(--ok); }
  .a11y-partial { color:var(--warn); border-color:var(--warn); }
  .a11y-defect { color:var(--bad); border-color:var(--bad); font-weight:600; }
  .a11y-not-applicable { color:var(--off); }
  .facts { font-size:.7rem; color:var(--muted); }
  .description { margin:.25rem 0 .75rem; color:var(--fg); }
  .install code { display:block; background:#0e1116; border:1px solid var(--border); border-radius:8px;
                  padding:.5rem .65rem; font-size:.78rem; overflow-x:auto; white-space:nowrap; }
  .row { display:flex; gap:.5rem; margin-top:.5rem; align-items:baseline; }
  .row-label { color:var(--muted); font-size:.72rem; min-width:4.5rem; flex:0 0 auto; }
  .chips { display:flex; gap:.25rem; flex-wrap:wrap; }
  .chip { font-size:.7rem; padding:.1rem .4rem; border-radius:6px; background:#0e1116; border:1px solid var(--border); }
  .chip.token { color:var(--accent); }
  .chip.path { color:var(--muted); }
  .notes { margin:.75rem 0 0; font-size:.76rem; color:var(--muted); border-inline-start:2px solid var(--border); padding-inline-start:.6rem; }
  .empty { color:var(--muted); padding:2rem 1.5rem; }
</style>
</head>
<body>
<header class="page">
  <h1>${escapeHtml(REGISTRY_NAME)} registry preview</h1>
  <p class="sub">${String(items.length)} items · ${Object.entries(byStatus)
    .map(([status, count]) => `${String(count)} ${escapeHtml(status)}`)
    .join(" · ")} · read live from <code>src/registry/items</code></p>
  <div class="controls">
    <input id="q" type="search" placeholder="Filter by name, description or tag…" aria-label="Filter registry items" />
    <select id="type" aria-label="Filter by item type">
      <option value="">all types</option>
      ${types.map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join("")}
    </select>
    <select id="a11y" aria-label="Filter by accessibility status">
      <option value="">any a11y status</option>
      <option value="audited">audited</option>
      <option value="partial">partial</option>
      <option value="not-applicable">not-applicable</option>
    </select>
  </div>
</header>
<main id="list">
${items.map(renderItem).join("\n")}
</main>
<p class="empty" id="empty" hidden>No item matches those filters.</p>
<script>
  const nodes = [...document.querySelectorAll(".item")];
  const q = document.getElementById("q");
  const type = document.getElementById("type");
  const a11y = document.getElementById("a11y");
  const empty = document.getElementById("empty");
  function apply() {
    const needle = q.value.trim().toLowerCase();
    let shown = 0;
    for (const node of nodes) {
      const match =
        (needle === "" || node.dataset.search.includes(needle)) &&
        (type.value === "" || node.dataset.type === type.value) &&
        (a11y.value === "" || node.dataset.a11y === a11y.value);
      node.hidden = !match;
      if (match) shown += 1;
    }
    empty.hidden = shown > 0;
  }
  for (const control of [q, type, a11y]) control.addEventListener("input", apply);
</script>
</body>
</html>`;
}

const argv = process.argv.slice(2);
const items = [...QP_REGISTRY_ITEMS].sort((a, b) => a.name.localeCompare(b.name));

if (argv.includes("--json")) {
  // The projected shadcn manifest, exactly as `registry:build` would emit it.
  console.log(
    JSON.stringify(
      projectRegistry(
        { name: REGISTRY_NAME, homepage: REGISTRY_HOMEPAGE, version: "0.1.0", items },
        { pathPrefix: UI_PACKAGE_PREFIX, githubRegistry: QP_GITHUB_REGISTRY },
      ),
      null,
      2,
    ),
  );
} else {
  const port = parsePort(argv);
  const namespace = parseNamespace(argv);
  const server = Bun.serve({
    port,
    async fetch(request) {
      const url = new URL(request.url);

      /*
       * `/r/{name}.json` — one item, with file CONTENT inlined.
       *
       * A GitHub source registry is special-cased by the CLI to fetch files
       * out of the repository. Every other hosted registry must return the
       * content in the item payload, which is what this does.
       */
      const itemMatch = /^\/r\/([a-z][a-z0-9-]*)\.json$/.exec(url.pathname);
      if (itemMatch?.[1] !== undefined) {
        const name = itemMatch[1];
        const found = items.find((entry) => entry.name === name);
        if (found === undefined) {
          return Response.json({ error: `Unknown registry item "${name}".` }, { status: 404 });
        }

        const projected = projectItem(found, {
          pathPrefix: UI_PACKAGE_PREFIX,
          localItemNames: new Set(items.map((entry) => entry.name)),
          ...(namespace === undefined ? {} : { namespace }),
        });

        const files = await Promise.all(
          found.files.map(async (file, index) => {
            // Served through the flattener: shadcn discards folder structure,
            // so a sibling-folder or nested-lib specifier must be rewritten
            // before it reaches a consumer. See `flattenRelativeImports`.
            const content = flattenRelativeImports(
              await Bun.file(absolutePathFor(file.path)).text(),
            );
            const projectedFile = projected.files[index];
            return {
              path: projectedFile?.path ?? file.path,
              type: projectedFile?.type ?? "registry:ui",
              content,
              // The PROJECTED target, not the canonical item's. `projectItem`
              // derives a folder target for component-type files; reading
              // `file.target` here would drop it and flatten every component
              // into the consumer's `ui` directory.
              ...(projectedFile?.target === undefined ? {} : { target: projectedFile.target }),
            };
          }),
        );

        return Response.json({ ...projected, files });
      }

      if (url.pathname === "/registry.json") {
        return Response.json(
          projectRegistry(
            { name: REGISTRY_NAME, homepage: REGISTRY_HOMEPAGE, version: "0.1.0", items },
            { pathPrefix: UI_PACKAGE_PREFIX, githubRegistry: QP_GITHUB_REGISTRY },
          ),
        );
      }
      return new Response(renderPage(items), {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    },
  });

  console.log(`registry preview   http://localhost:${String(server.port)}`);
  console.log(`projected manifest http://localhost:${String(server.port)}/registry.json`);
  console.log(`installable items  http://localhost:${String(server.port)}/r/{name}.json`);
  if (namespace !== undefined) {
    console.log(`namespace          ${namespace}`);
  }
}

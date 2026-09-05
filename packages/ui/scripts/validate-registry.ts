#!/usr/bin/env bun
/**
 * validate-registry — prove the registry matches the tree, then emit it.
 *
 * Every item in the registry is a promise to a consumer: these files exist,
 * these npm packages are needed, these tokens are consumed, this is the
 * accessibility status. The promise is written by hand and the tree changes
 * daily, so without a gate the two drift silently and a consumer's
 * `shadcn add` fetches a file that was renamed three commits ago.
 *
 * This is the gate. It is a thin CLI over two pure pieces:
 *   - `src/registry/schemas/*` — zod schemas: the SHAPE of a valid item.
 *   - `src/registry/utils/validate.ts` — rules that compare items to the tree.
 *
 * With `--write` it also emits the two shadcn manifests. Writing happens ONLY
 * after validation passes, so a broken registry can never be published.
 *
 * Usage:
 *   bun run registry:validate            # check, exit non-zero on error
 *   bun run registry:build               # check, then write both manifests
 *   bun run registry:validate -- --json  # machine-readable issue list
 */

import { QP_REGISTRY_VALUE } from "../src/registry/registry";
import {
  ROOT_REGISTRY_MANIFEST_PATH,
  UI_PACKAGE_PREFIX,
  UI_REGISTRY_MANIFEST_PATH,
  absolutePathFor,
} from "../src/registry/utils/paths";
import { QP_GITHUB_REGISTRY, projectRegistry } from "../src/registry/utils/project-shadcn";
import { loadSnapshot } from "../src/registry/utils/snapshot";
import { loadTokenLookup } from "../src/registry/utils/tokens";
import {
  collectDeclaredPaths,
  hasErrors,
  validate,
  type ValidationIssue,
} from "../src/registry/utils/validate";
import { qpRegistrySchema } from "../src/registry/schemas/registry.schema";

const argv = process.argv.slice(2);
const write = argv.includes("--write");
const json = argv.includes("--json");

function formatIssue(entry: ValidationIssue): string {
  const location = [entry.itemName, entry.file].filter(Boolean).join(" · ");
  const prefix = entry.level === "error" ? "ERROR" : "warn ";
  return `  ${prefix}  [${entry.rule}]${location === "" ? "" : ` ${location}`}\n         ${entry.message}`;
}

const [snapshot, lookup] = await Promise.all([
  loadSnapshot(collectDeclaredPaths(QP_REGISTRY_VALUE)),
  loadTokenLookup(),
]);
const issues = validate(QP_REGISTRY_VALUE, snapshot, lookup);

if (json) {
  console.log(JSON.stringify({ issues, ok: !hasErrors(issues) }, null, 2));
} else {
  const errors = issues.filter((entry) => entry.level === "error");
  const warnings = issues.filter((entry) => entry.level === "warning");

  for (const entry of issues) {
    console.log(formatIssue(entry));
  }

  console.log(
    `\n${String(QP_REGISTRY_VALUE.items.length)} items · ${String(errors.length)} error(s) · ${String(warnings.length)} warning(s)`,
  );
}

if (hasErrors(issues)) {
  console.error("\nregistry validation failed — manifests not written.");
  process.exit(1);
}

if (!write) {
  process.exit(0);
}

/*
 * Parse before projecting. `validate()` has already reported every schema
 * problem as an attributed issue, so this cannot realistically throw — but it
 * is what narrows the value from "shaped like a registry" to `QpRegistry`, and
 * it means the projection can never receive a partially-valid item.
 */
const registry = qpRegistrySchema.parse(QP_REGISTRY_VALUE);

/*
 * Two manifests, because shadcn resolves them differently:
 *
 *   packages/ui/registry.json — paths relative to packages/ui/, which is what
 *   the shadcn CLI expects when `components.json` sits beside it.
 *
 *   registry.json (repo root) — a GitHub source registry ALWAYS resolves the
 *   repository's ROOT registry.json, so `bunx shadcn add
 *   QPMatrix/qpm-ui/<item>` reads this one. Its paths are
 *   repo-root-relative, i.e. unprefixed.
 */
const packageManifest = projectRegistry(registry, {
  pathPrefix: UI_PACKAGE_PREFIX,
  githubRegistry: QP_GITHUB_REGISTRY,
});

const rootManifest = projectRegistry(registry, {
  pathPrefix: "",
  githubRegistry: QP_GITHUB_REGISTRY,
});

await Bun.write(
  absolutePathFor(UI_REGISTRY_MANIFEST_PATH),
  `${JSON.stringify(packageManifest, null, 2)}\n`,
);
await Bun.write(
  absolutePathFor(ROOT_REGISTRY_MANIFEST_PATH),
  `${JSON.stringify(rootManifest, null, 2)}\n`,
);

console.log(`\nwrote ${UI_REGISTRY_MANIFEST_PATH}`);
console.log(`wrote ${ROOT_REGISTRY_MANIFEST_PATH}`);

#!/usr/bin/env bun
/**
 * check-component — the single-component gate.
 *
 * `registry:validate` answers "is the whole registry consistent?". While you
 * are writing ONE component that is the wrong question: the output is a wall of
 * issues about other people's items, and the thing you actually need to know —
 * "is this component finished?" — is not a rule the registry validator has.
 *
 * This narrows the same rule set to one item and adds the checks that only make
 * sense per-component, which together are the machine-checkable half of
 * docs/standards/component-definition-of-done.md:
 *
 *   - it is registered at all;
 *   - the folder has all seven files (markup, types, constants, utils, test,
 *     stories, barrel);
 *   - no `TODO(scaffold)` marker survives;
 *   - no `import * as React`, no inline `style={{}}`;
 *   - every registry rule that mentions this item passes.
 *
 * Usage:
 *   bun run registry:check metric-card
 *   bun run registry:check metric-card --json
 */

import { existsSync } from "node:fs";
import { join } from "node:path";

import { QP_REGISTRY_VALUE } from "../src/registry/registry";
import { UI_PACKAGE_DIR, absolutePathFor } from "../src/registry/utils/paths";
import { loadSnapshot } from "../src/registry/utils/snapshot";
import { loadTokenLookup } from "../src/registry/utils/tokens";
import {
  collectDeclaredPaths,
  validate,
  type ValidationIssue,
} from "../src/registry/utils/validate";

const argv = process.argv.slice(2);
const json = argv.includes("--json");
const name = argv.find((entry) => !entry.startsWith("--"));

if (name === undefined) {
  console.error(
    "check-component: pass a component name, e.g. `bun run registry:check metric-card`.",
  );
  process.exit(1);
}

interface Finding {
  readonly level: "error" | "warning";
  readonly rule: string;
  readonly message: string;
}

const findings: Finding[] = [];

/* ------------------------------------------------------------------ */
/* 1. Is it registered?                                                */
/* ------------------------------------------------------------------ */

const item = QP_REGISTRY_VALUE.items.find((entry) => entry.name === name);

if (item === undefined) {
  findings.push({
    level: "error",
    rule: "not-registered",
    message: `No registry item named "${name}". Add packages/ui/src/registry/items/${name}.ts and list it in that directory's index.ts — \`bun run scaffold\` does both.`,
  });
}

/* ------------------------------------------------------------------ */
/* 2. Does the folder have every file the house layout requires?        */
/* ------------------------------------------------------------------ */

const folder = join(UI_PACKAGE_DIR, "src", "components", name);

if (!existsSync(folder)) {
  findings.push({
    level: "error",
    rule: "missing-folder",
    message: `packages/ui/src/components/${name}/ does not exist. Every QPMatrix component is a folder, not a loose file.`,
  });
} else {
  const required: { file: string; why: string }[] = [
    { file: `${name}.tsx`, why: "the component's markup" },
    { file: `${name}.types.ts`, why: "the props interface and public unions" },
    { file: `${name}.constants.ts`, why: "cva class maps and fixed values" },
    { file: `${name}.utils.ts`, why: "pure helpers" },
    { file: `${name}.test.tsx`, why: "the accessibility + props contract suite" },
    { file: `${name}.stories.tsx`, why: "the Storybook preview and its a11y pass" },
    { file: "index.ts", why: "the folder barrel" },
  ];

  for (const { file, why } of required) {
    if (!existsSync(join(folder, file))) {
      findings.push({
        level: "error",
        rule: "incomplete-folder",
        message: `Missing ${name}/${file} — ${why}.`,
      });
    }
  }
}

/* ------------------------------------------------------------------ */
/* 3. Source-level house rules, scoped to this component's own files.  */
/* ------------------------------------------------------------------ */

const [snapshot, lookup] = await Promise.all([
  loadSnapshot(collectDeclaredPaths(QP_REGISTRY_VALUE)),
  loadTokenLookup(),
]);

const ownedPaths =
  item === undefined
    ? []
    : [
        ...item.files.map((file) => file.path),
        `packages/ui/src/components/${name}/${name}.test.tsx`,
        `packages/ui/src/components/${name}/${name}.stories.tsx`,
      ];

for (const path of ownedPaths) {
  const source =
    snapshot.files.get(path) ??
    (await Bun.file(absolutePathFor(path))
      .text()
      .catch(() => null));
  if (source === null || source === undefined) {
    continue;
  }

  if (source.includes("TODO(scaffold)")) {
    findings.push({
      level: "error",
      rule: "unfinished-scaffold",
      message: `${path} still contains a TODO(scaffold) marker. The scaffold is a starting point; a component is not done while any marker survives.`,
    });
  }

  if (/import \* as React from ["']react["']/.test(source)) {
    findings.push({
      level: "error",
      rule: "react-namespace-import",
      message: `${path} uses \`import * as React\`. Import only what you need (\`import { useId, type ReactNode } from "react"\`) so the module's real dependencies are visible.`,
    });
  }

  // `style={{` only. A `style` STRING attribute is what `render` composition
  // legitimately forwards, and CSS-variable pass-through on a wrapper is
  // allowed — but a literal style object in a component is a token bypass.
  if (
    /style=\{\{/.test(source) &&
    !source.includes("// eslint-disable-next-line qp/allow-inline-style")
  ) {
    findings.push({
      level: "warning",
      rule: "inline-style",
      message: `${path} contains an inline \`style={{ … }}\` object. Use Tailwind token-role classes; if this is a CSS-variable pass-through, say so in a comment above it.`,
    });
  }
}

/* ------------------------------------------------------------------ */
/* 4. Every registry rule that mentions this item.                     */
/* ------------------------------------------------------------------ */

const registryIssues: ValidationIssue[] = validate(QP_REGISTRY_VALUE, snapshot, lookup).filter(
  (entry) => entry.itemName === name || entry.file?.includes(`/components/${name}/`) === true,
);

for (const entry of registryIssues) {
  findings.push({ level: entry.level, rule: entry.rule, message: entry.message });
}

/* ------------------------------------------------------------------ */

const errors = findings.filter((entry) => entry.level === "error");

if (json) {
  console.log(JSON.stringify({ name, findings, ok: errors.length === 0 }, null, 2));
} else {
  for (const entry of findings) {
    console.log(
      `  ${entry.level === "error" ? "ERROR" : "warn "}  [${entry.rule}]\n         ${entry.message}`,
    );
  }
  if (findings.length === 0) {
    console.log(`  ${name}: every machine-checkable gate passes.`);
    console.log(
      "\n  Still yours to confirm by hand (docs/standards/component-definition-of-done.md):\n" +
        "    - the Storybook a11y panel is clean for every story;\n" +
        "    - the keyboard path was driven with a real keyboard, not just asserted;\n" +
        "    - the accessibility `notes` in the registry item describe what you actually audited.",
    );
  } else {
    console.log(
      `\n${name}: ${String(errors.length)} error(s), ${String(findings.length - errors.length)} warning(s)`,
    );
  }
}

process.exit(errors.length === 0 ? 0 : 1);

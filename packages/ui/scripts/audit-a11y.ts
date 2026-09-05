import { $ } from "bun";
import { resolve } from "node:path";

/**
 * `bun run a11y:audit` (packages/ui/package.json).
 *
 * Runs @qpmatrix/ui's automated accessibility test suite (the `bun test`
 * suites that call `expectNoAxeViolations` / the `src/testing/a11y.ts`
 * assertions from within each component's `*.test.tsx`), then prints an
 * explicit manual-verification checklist for everything automation cannot
 * decide. A clean automated run is necessary, not sufficient — see
 * `src/testing/axe.ts`'s module doc comment on what `color-contrast` alone
 * cannot tell you, and the checklist below for what no DOM-level check can
 * tell you at all.
 *
 * Exit code follows the test run: 0 only if `bun test` passed.
 */

const scriptsDir = import.meta.dir;
const uiRoot = resolve(scriptsDir, "..");
const gitRoot = resolve(uiRoot, "..", "..");
const testTarget = "packages/ui/src/components";

const MANUAL_VERIFICATION_CHECKLIST = [
  "Real screen-reader announcement (VoiceOver/NVDA/JAWS) — axe and DOM assertions confirm the accessibility tree is structurally correct, not that an announcement is comprehensible or well-paced.",
  "Focus visibility against a real rendered background — contrast.ts checks the focus-ring token pair's ratio; it cannot see whether the ring is actually painted (z-index, overflow:hidden, or a sibling element covering it) in a real browser.",
  "Reflow at 320px viewport width (WCAG 1.4.10) — happy-dom has no layout engine, so nothing here can catch content that clips, overlaps, or requires two-dimensional scrolling at mobile width.",
  "`prefers-reduced-motion` honoured in a real browser — CSS media-query behaviour is not evaluated under happy-dom.",
  'RTL layout (Arabic/Hebrew, `dir="rtl"`) — logical-property usage and mirrored icon/affordance placement need visual verification in a real browser.',
];

function printManualVerificationChecklist(): void {
  console.log("");
  console.log("MANUAL VERIFICATION STILL REQUIRED (not decidable by this automated run):");
  for (const item of MANUAL_VERIFICATION_CHECKLIST) {
    console.log(`  [ ] ${item}`);
  }
  console.log("");
}

async function main(): Promise<void> {
  console.log(`Running automated accessibility test suite: bun test ${testTarget}`);
  console.log(`(cwd: ${gitRoot})`);
  console.log("");

  const result = await $`bun test ${testTarget}`.cwd(gitRoot).nothrow();

  printManualVerificationChecklist();

  process.exit(result.exitCode);
}

await main();

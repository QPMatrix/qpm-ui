import { Glob } from "bun";
import { dirname, join, relative, resolve } from "node:path";

/**
 * `bun run a11y:contract` (packages/ui/package.json).
 *
 * NOTE on scope: rule 1 (sibling test) and rules 2-3 (keyboard/focus
 * assertions) apply to QPMatrix-AUTHORED components. Upstream shadcn/Base UI
 * primitives under `src/components/ui/` are held to a different, equally
 * enforced standard — see `isUpstreamPrimitive` and `checkPrimitiveHonesty`.
 * Rules 4-5 apply to every file.
 *
 * Statically enforces @qpmtx/ui's "interactive contract" over every
 * component source file under `src/components/` (both the canonical shadcn
 * Base-UI primitives in `src/components/ui/` and the QPMatrix public
 * component files above it — walked recursively rather than assuming a fixed
 * set of group directories, since those files are under active rewrite by
 * other workers and their exact layout may change under this script):
 *
 *   1. any file rendering an interactive element (button, input, select,
 *      textarea, `a[href]`, or a Base UI primitive) must have a sibling
 *      `*.test.tsx`;
 *   2. that test file must contain at least one keyboard assertion
 *      (`userEvent.tab()`/`.keyboard(` or `fireEvent.keyDown`);
 *   3. overlay components (`dialog`/`popover`/`menu`/`drawer`/`tooltip` in
 *      the filename, or `role="dialog"` in the source) must additionally
 *      have a focus assertion (`toHaveFocus`) in their test file;
 *   4. no source file may set a positive `tabIndex`;
 *   5. no source file may set `outline: none` / `outline-none` without a
 *      `focus-visible:` replacement in the same file.
 *
 * Prints one line per failure as `file:line — message` and exits non-zero on
 * any failure. Paths resolve from `import.meta.dir`, not `process.cwd()`, so
 * the result is identical regardless of where `bun run` is invoked from.
 */

const scriptsDir = import.meta.dir;
const uiRoot = resolve(scriptsDir, "..");
const gitRoot = resolve(uiRoot, "..", "..");
const componentsDir = join(uiRoot, "src", "components");

interface Finding {
  readonly file: string;
  readonly line: number;
  readonly message: string;
}

const INTERACTIVE_TAG_PATTERN =
  /<button[\s/>]|<input[\s/>]|<select[\s/>]|<textarea[\s/>]|<a\s[^>]*\bhref\b/i;
const BASE_UI_IMPORT_PATTERN = /from\s+["']@base-ui\/react/;
const OVERLAY_FILENAME_PATTERN = /dialog|popover|menu|drawer|tooltip/i;
const OVERLAY_ROLE_PATTERN = /role=["']dialog["']/;
const KEYBOARD_ASSERTION_PATTERN = /userEvent\.tab\(|\.keyboard\(|fireEvent\.keyDown/;
const FOCUS_ASSERTION_PATTERN = /toHaveFocus/;
const POSITIVE_TABINDEX_PATTERN = /tabIndex=\{?\s*["']?(\d+)["']?\s*\}?/g;
const OUTLINE_NONE_PATTERN = /outline-none\b|outline\s*:\s*none\b/g;
/**
 * A visible replacement for a removed outline, looked for on the SAME element.
 *
 * The original rule asked only whether `focus-visible:` appeared anywhere in
 * the file, which is both too weak (a ring on a different element counts) and
 * too strong (it flags elements that legitimately have no keyboard focus at
 * all). Judging per-element instead makes it mean something:
 *
 *   focus-visible: / focus:      an explicit keyboard-focus style
 *   data-[active   data-[highlighted   data-[selected   aria-selected
 *                                a roving/active-descendant indicator, which is
 *                                how menus, comboboxes and OTP slots show the
 *                                current item — the element is not focused, so
 *                                a focus ring would never appear on it anyway
 *   ring-                        a persistent ring already drawn on the element
 */
const FOCUS_REPLACEMENT_PATTERN =
  /focus-visible:|focus:|data-\[active|data-\[highlighted|data-\[selected|aria-selected|ring-/;

/**
 * Elements that receive focus PROGRAMMATICALLY rather than through tab order.
 *
 * A dialog panel is focused on open to move the reading position; it is not in
 * the tab sequence, so WCAG 2.2 SC 2.4.7 (which is about keyboard focus being
 * visible) does not require a ring on it — and drawing one is widely treated as
 * noise, because the user did not tab there. A `Positioner` or `Backdrop` is
 * not focusable at all.
 *
 * This is deliberately a NARROW list of slot names, not a filename match: the
 * focusable controls INSIDE a dialog are still checked.
 */
const PROGRAMMATIC_FOCUS_SLOT_PATTERN =
  /data-slot="(?:[a-z-]+-)?(?:content|positioner|backdrop|overlay|portal|viewport|list|panel)"/;

/**
 * Base UI structural primitives that are never in the tab order.
 *
 * `Positioner`, `Portal`, `Backdrop` and `Viewport` exist to place or contain
 * other elements; they render no focusable control, so `outline-none` on them
 * suppresses nothing a user could ever see. Matched by the rendered component
 * name because these have no `data-slot` of their own.
 */
const NON_FOCUSABLE_PRIMITIVE_PATTERN =
  /<[A-Za-z]+Primitive\.(?:Positioner|Portal|Backdrop|Viewport)\b/;

/**
 * The focus indicator is on an ANCESTOR.
 *
 * `focus-within:` is the idiom for exactly this: a chips field draws the ring
 * on its container, and the inner `<input>` must suppress its own or the two
 * would nest. The wrapper can be fifty lines away, so this is judged over the
 * whole file — which is sound, because a file containing `focus-within:` has
 * demonstrably not forgotten about focus.
 */
const FOCUS_WITHIN_PATTERN = /focus-within:/;

/**
 * Named, reviewable exceptions: grouping containers that are not focusable.
 *
 * Deliberately an explicit LIST rather than a widened pattern. `item` alone
 * would be far too broad — a menu item, a select item and a command item are
 * all focusable and must keep an indicator. Each entry here is a specific
 * element somebody looked at.
 *
 *   questionnaire-item — a <fieldset> grouping one question's controls. The
 *     `border-0 p-0` in its class list is the fieldset-reset idiom. The
 *     controls INSIDE it are still checked.
 */
const NON_FOCUSABLE_SLOT_EXCEPTIONS = new Set(["questionnaire-item"]);

function isExemptedSlot(context: string): boolean {
  const match = /data-slot="([a-z-]+)"/.exec(context);
  return match?.[1] !== undefined && NON_FOCUSABLE_SLOT_EXCEPTIONS.has(match[1]);
}

function toRelative(path: string): string {
  return relative(gitRoot, path);
}

async function listComponentSourceFiles(): Promise<string[]> {
  const glob = new Glob("**/*.tsx");
  const matches: string[] = [];
  for await (const match of glob.scan({ cwd: componentsDir })) {
    // Tests and stories PROVE components; they are not components. Scanning a
    // story would demand a `<name>.stories.test.tsx` sibling, and the source it
    // previews (`<name>.tsx`) is already covered by this walk.
    if (match.endsWith(".test.tsx") || match.endsWith(".stories.tsx") || match.endsWith(".d.tsx")) {
      continue;
    }
    matches.push(join(componentsDir, match));
  }
  return matches.sort();
}

function isInteractiveSource(source: string): boolean {
  return INTERACTIVE_TAG_PATTERN.test(source) || BASE_UI_IMPORT_PATTERN.test(source);
}

function isOverlayComponent(filePath: string, source: string): boolean {
  return OVERLAY_FILENAME_PATTERN.test(filePath) || OVERLAY_ROLE_PATTERN.test(source);
}

function siblingTestPath(sourcePath: string): string {
  return sourcePath.replace(/\.tsx$/, ".test.tsx");
}

/**
 * Is this an upstream shadcn/Base UI primitive rather than QPMatrix-authored code?
 *
 * `src/components/ui/` holds files the shadcn CLI writes and re-writes. Their
 * keyboard and ARIA behaviour is owned and tested by Base UI upstream, and a
 * QPMatrix-authored keyboard test for `dropdown-menu` would be re-testing
 * someone else's library — which sounds rigorous and is actually a maintenance
 * liability that breaks on every upstream release.
 *
 * So the rule differs by ownership rather than being waived:
 *
 *   - QPMatrix components MUST have a sibling test with keyboard assertions.
 *   - Upstream primitives must instead declare `accessibility.status:
 *     "partial"` in their registry item, with notes saying who owns the
 *     behaviour. `checkPrimitiveHonesty` below enforces that, so a primitive
 *     cannot claim "audited" without QPMatrix having actually audited it.
 *
 * Every OTHER rule here — positive tabIndex, unreplaced outline removal —
 * applies to primitives exactly as it does to components, because those are
 * defects regardless of who wrote the file.
 */
function isUpstreamPrimitive(sourcePath: string): boolean {
  return toRelative(sourcePath).includes("/src/components/ui/");
}

function findPositiveTabIndexFindings(sourcePath: string, source: string): Finding[] {
  const findings: Finding[] = [];
  const lines = source.split("\n");
  lines.forEach((lineText, index) => {
    POSITIVE_TABINDEX_PATTERN.lastIndex = 0;
    let match = POSITIVE_TABINDEX_PATTERN.exec(lineText);
    while (match !== null) {
      const value = Number.parseInt(match[1] ?? "", 10);
      if (!Number.isNaN(value) && value > 0) {
        findings.push({
          file: toRelative(sourcePath),
          line: index + 1,
          message: `positive tabIndex (${match[0]}) overrides natural tab order — never override it`,
        });
      }
      match = POSITIVE_TABINDEX_PATTERN.exec(lineText);
    }
  });
  return findings;
}

function findOutlineNoneFindings(sourcePath: string, source: string): Finding[] {
  const findings: Finding[] = [];
  const lines = source.split("\n");

  /*
   * The class string and the `data-slot` that identifies the element are
   * usually a few lines apart in a `cn(...)` call, so judge over a small
   * window around the match rather than the single line. Ten lines back covers
   * every case in this tree without reaching the previous component.
   */
  const windowAround = (index: number): string =>
    lines.slice(Math.max(0, index - 10), index + 3).join("\n");
  lines.forEach((lineText, index) => {
    OUTLINE_NONE_PATTERN.lastIndex = 0;
    if (OUTLINE_NONE_PATTERN.test(lineText)) {
      const context = windowAround(index);
      if (
        FOCUS_REPLACEMENT_PATTERN.test(context) ||
        PROGRAMMATIC_FOCUS_SLOT_PATTERN.test(context) ||
        NON_FOCUSABLE_PRIMITIVE_PATTERN.test(context) ||
        isExemptedSlot(context) ||
        FOCUS_WITHIN_PATTERN.test(source)
      ) {
        return;
      }
      findings.push({
        file: toRelative(sourcePath),
        line: index + 1,
        message:
          'outline suppressed ("outline-none" / "outline: none") with no "focus-visible:" replacement in this file',
      });
    }
  });
  return findings;
}

async function checkFile(sourcePath: string): Promise<Finding[]> {
  const source = await Bun.file(sourcePath).text();
  const findings: Finding[] = [
    ...findPositiveTabIndexFindings(sourcePath, source),
    ...findOutlineNoneFindings(sourcePath, source),
  ];

  const overlay = isOverlayComponent(sourcePath, source);
  const interactive = isInteractiveSource(source) || overlay;
  if (!interactive) {
    return findings;
  }

  // Upstream primitives are held to `checkPrimitiveHonesty` instead — they must
  // declare that QPMatrix has NOT audited them, rather than carry a
  // QPMatrix-authored re-test of Base UI's own keyboard model.
  if (isUpstreamPrimitive(sourcePath)) {
    return findings;
  }

  const testPath = siblingTestPath(sourcePath);
  const testFile = Bun.file(testPath);
  const testFileExists = await testFile.exists();
  if (!testFileExists) {
    findings.push({
      file: toRelative(sourcePath),
      line: 1,
      message: `renders an interactive element but has no sibling ${relative(dirname(sourcePath), testPath)} test file`,
    });
    return findings;
  }

  const testSource = await testFile.text();
  if (!KEYBOARD_ASSERTION_PATTERN.test(testSource)) {
    findings.push({
      file: toRelative(testPath),
      line: 1,
      message:
        "no keyboard assertion (userEvent.tab()/.keyboard(...) or fireEvent.keyDown) for an interactive component's test file",
    });
  }

  if (overlay && !FOCUS_ASSERTION_PATTERN.test(testSource)) {
    findings.push({
      file: toRelative(testPath),
      line: 1,
      message: "overlay component's test file has no focus assertion (toHaveFocus)",
    });
  }

  return findings;
}

/**
 * Upstream primitives must be HONEST about not having been audited.
 *
 * This is the other half of the ownership split. A primitive is exempt from
 * needing a QPMatrix keyboard test — but only while its registry item says so.
 * The moment somebody marks one `accessibility.status: "audited"`, this rule
 * demands the sibling test that claim implies, so "audited" can never be a
 * word somebody typed rather than work somebody did.
 */
async function checkPrimitiveHonesty(): Promise<Finding[]> {
  const { QP_REGISTRY_ITEMS } = await import("../src/registry/items/index");
  const findings: Finding[] = [];

  for (const item of QP_REGISTRY_ITEMS) {
    if (item.type !== "primitive" || item.accessibility.status !== "audited") {
      continue;
    }
    for (const file of item.files) {
      if (!file.path.includes("/src/components/ui/")) {
        continue;
      }
      const testPath = join(gitRoot, file.path.replace(/\.tsx$/, ".test.tsx"));
      if (!(await Bun.file(testPath).exists())) {
        findings.push({
          file: file.path,
          line: 1,
          message: `registry item "${item.name}" claims accessibility.status "audited", but there is no ${relative(gitRoot, testPath)} proving it. Either write the audit's tests or set the status back to "partial".`,
        });
      }
    }
  }

  return findings;
}

async function main(): Promise<void> {
  const files = await listComponentSourceFiles();
  if (files.length === 0) {
    console.error(`No component source files found under ${toRelative(componentsDir)}.`);
    process.exit(1);
  }

  const findingLists = await Promise.all(files.map((file) => checkFile(file)));
  const findings = [...findingLists.flat(), ...(await checkPrimitiveHonesty())];

  if (findings.length === 0) {
    console.log(`OK — interactive contract holds for ${files.length} component source file(s).`);
    return;
  }

  console.error(`FAIL — ${findings.length} interactive-contract violation(s):`);
  for (const finding of findings) {
    console.error(`${finding.file}:${finding.line} — ${finding.message}`);
  }
  process.exit(1);
}

await main();

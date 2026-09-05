import { z } from "zod";

/**
 * The QPMatrix canonical registry item schema.
 *
 * This vocabulary is the source of truth for what @qpmtx/ui distributes.
 * shadcn's `registry:*` type names are a *projection target* only — see
 * `../utils/project-shadcn.ts`. Nothing in this file may be widened to make a
 * shadcn concept fit; the projection adapts, not the canon.
 *
 * Everything here is tooling-side. `tsconfig.build.json` excludes
 * `src/registry`, so zod never becomes a runtime dependency of the published
 * package.
 */

/** Kebab-case, ASCII, no leading/trailing/double dashes. */
export const KEBAB_CASE_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

/** Exact `major.minor.patch`. No pre-release/build metadata for registry items. */
export const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;

/** A WCAG 2.2 success criterion number, e.g. `2.1.1` or `1.4.11`. */
export const WCAG_CRITERION_PATTERN = /^\d\.\d\.\d{1,2}$/;

/** Consumer-facing alias paths always start with the shadcn alias root. */
export const ALIAS_PREFIX = "@/";

export const QP_ITEM_TYPES = [
  "component",
  "primitive",
  "hook",
  "utility",
  "pattern",
  "token-extension",
  "form-pattern",
] as const;

export const qpItemTypeSchema = z.enum(QP_ITEM_TYPES);
export type QpItemType = z.infer<typeof qpItemTypeSchema>;

export const QP_PLATFORMS = ["web", "react-native", "desktop", "server"] as const;

export const qpPlatformSchema = z.enum(QP_PLATFORMS);
export type QpPlatform = z.infer<typeof qpPlatformSchema>;

export const QP_ACCESSIBILITY_STATUSES = ["audited", "partial", "not-applicable"] as const;

export const qpAccessibilityStatusSchema = z.enum(QP_ACCESSIBILITY_STATUSES);
export type QpAccessibilityStatus = z.infer<typeof qpAccessibilityStatusSchema>;

/**
 * A repo-root-relative POSIX path, e.g. `packages/ui/src/components/ui/button.tsx`.
 * Absolute paths, Windows separators and `..` traversal are rejected so a single
 * string can be resolved identically from any process CWD.
 */
export const repoRelativePathSchema = z
  .string()
  .min(1, { error: "File path must not be empty." })
  .refine((value) => !value.includes("\\"), {
    error: "File path must use POSIX separators (`/`), not backslashes.",
  })
  .refine((value) => !value.startsWith("/"), {
    error: "File path must be repo-root-relative, not absolute.",
  })
  .refine((value) => !value.split("/").includes(".."), {
    error: "File path must not contain `..` segments.",
  });

export const qpRegistryFileSchema = z.strictObject({
  /** Repo-root-relative source path that this item ships. */
  path: repoRelativePathSchema,
  /**
   * Where the file lands in the consumer project, relative to their project
   * root. Required whenever the basename alone would be ambiguous.
   */
  target: z.string().min(1, { error: "`target` must not be empty when present." }).optional(),
});

export type QpRegistryFile = z.infer<typeof qpRegistryFileSchema>;

/**
 * A WCAG failure this item is KNOWN to have and has not fixed.
 *
 * This type exists because the schema previously could not express one. An
 * interactive item was forced to declare `keyboardTested: true`, so the only
 * way to record "we tested the keyboard path and it fails" was to write a
 * sentence in `notes` that no gate reads — and the one time that was tried,
 * the sentence never got written and the item shipped claiming its keyboard
 * path was tested and fine. A false accessibility attestation is worse than a
 * missing one, so the failure now has somewhere structured to live.
 */
export const qpKnownDefectSchema = z.strictObject({
  /** The success criterion that fails, e.g. `2.1.1`. */
  criterion: z.string().regex(WCAG_CRITERION_PATTERN, {
    error: "`criterion` must be a WCAG success-criterion number such as `2.1.1`.",
  }),
  /** What actually fails, specifically enough for a reader to reproduce it. */
  summary: z.string().min(1, { error: "`summary` must not be empty." }),
  /** Who has to fix it: `@qpmtx/ui`, or the upstream package that owns it. */
  owner: z.string().min(1, { error: "`owner` must name who has to fix the defect." }),
});

export type QpKnownDefect = z.infer<typeof qpKnownDefectSchema>;

export const qpAccessibilitySchema = z.strictObject({
  status: qpAccessibilityStatusSchema,
  /** The only level QPMatrix ships against (docs/standards/accessibility.md). */
  wcagLevel: z.enum(["2.2-AA"]),
  /** Does the item render anything a user can focus, click, or type into? */
  interactive: z.boolean(),
  /** Has the keyboard interaction model been exercised by a test? */
  keyboardTested: z.boolean(),
  /** Does the item own focus (trap, restore, roving tabindex)? */
  focusManaged: z.boolean(),
  /**
   * WCAG failures this item is known to have. Present and non-empty means the
   * item ships with a recorded defect, which forbids `status: "audited"`.
   *
   * Optional rather than defaulted so the 80-odd items with nothing to declare
   * stay silent instead of carrying an empty array each. Read it through
   * `knownDefectsOf`, never directly.
   */
  knownDefects: z.array(qpKnownDefectSchema).min(1).optional(),
  notes: z.string().min(1, { error: "`notes` must not be empty when present." }).optional(),
});

export type QpAccessibility = z.infer<typeof qpAccessibilitySchema>;

/** The recorded WCAG failures for an item, with "none declared" flattened to `[]`. */
export function knownDefectsOf(accessibility: QpAccessibility): readonly QpKnownDefect[] {
  return accessibility.knownDefects ?? [];
}

export const aliasPathSchema = z.string().refine((value) => value.startsWith(ALIAS_PREFIX), {
  error: `Alias path must start with "${ALIAS_PREFIX}".`,
});

const qpRegistryItemShape = z.strictObject({
  name: z.string().regex(KEBAB_CASE_PATTERN, {
    error: "Item name must be kebab-case (e.g. `radio-group`).",
  }),
  type: qpItemTypeSchema,
  description: z.string().min(1, { error: "`description` must not be empty." }),
  version: z.string().regex(SEMVER_PATTERN, {
    error: "`version` must be an exact `major.minor.patch` semver string.",
  }),
  files: z.array(qpRegistryFileSchema).min(1, { error: "An item must ship at least one file." }),
  /** npm package specifiers this item's files import at runtime. */
  dependencies: z.array(z.string().min(1)).default([]),
  /** Other QPMatrix item names, or shadcn/namespace/github item addresses. */
  registryDependencies: z.array(z.string().min(1)).default([]),
  /** Alias kind (`ui`, `lib`, `utils`, ...) -> the consumer alias path it needs. */
  aliases: z.record(z.string().regex(KEBAB_CASE_PATTERN), aliasPathSchema),
  /** @qpmtx/tokens custom-property names, WITHOUT the leading `--`. */
  tokenDependencies: z.array(z.string().min(1)).default([]),
  accessibility: qpAccessibilitySchema,
  supportedPlatforms: z
    .array(qpPlatformSchema)
    .min(1, { error: "An item must declare at least one supported platform." }),
  tags: z.array(z.string().min(1)).default([]),
});

/**
 * An interactive item is a keyboard-operable item. If it renders something a
 * user can drive, its keyboard path must either be tested and working, or its
 * failure must be recorded in `knownDefects` — and either way it is not
 * "not-applicable".
 *
 * The `knownDefects` escape is deliberately narrow. It is not a way to skip
 * testing: you may only claim `keyboardTested: false` by naming the criterion
 * that fails, describing it, and saying who owns the fix. Recording a defect
 * then costs you the "audited" status until it is resolved, which is the whole
 * point — an item cannot both admit a WCAG failure and claim a clean audit.
 */
export const qpRegistryItemSchema = qpRegistryItemShape
  .refine(
    (item) => !item.accessibility.interactive || item.accessibility.status !== "not-applicable",
    {
      error: 'An interactive item must not declare `accessibility.status` as "not-applicable".',
      path: ["accessibility", "status"],
    },
  )
  .refine(
    (item) =>
      !item.accessibility.interactive ||
      item.accessibility.keyboardTested ||
      knownDefectsOf(item.accessibility).length > 0,
    {
      error:
        "An interactive item must set `accessibility.keyboardTested` to true, or record why " +
        "it cannot in `accessibility.knownDefects`. An interactive component ships only once " +
        "its keyboard path is tested, or once its failure is written down.",
      path: ["accessibility", "keyboardTested"],
    },
  )
  .refine(
    (item) =>
      knownDefectsOf(item.accessibility).length === 0 || item.accessibility.status !== "audited",
    {
      error:
        'An item with recorded `accessibility.knownDefects` must not claim `status: "audited"`. ' +
        "Fix the defect or drop the claim.",
      path: ["accessibility", "status"],
    },
  );

export type QpRegistryItem = z.infer<typeof qpRegistryItemSchema>;

import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Single-select joined segment row built on ui/toggle-group. */
export const segmentedControl: QpRegistryItem = {
  name: "segmented-control",
  type: "component",
  description: "Single-select joined segment row built on ui/toggle-group.",
  version: "0.1.0",
  files: [
    { path: "packages/ui/src/components/segmented-control/segmented-control.tsx" },
    { path: "packages/ui/src/components/segmented-control/segmented-control.types.ts" },
    { path: "packages/ui/src/components/segmented-control/segmented-control.constants.ts" },
    { path: "packages/ui/src/components/segmented-control/segmented-control.utils.ts" },
  ],
  dependencies: ["class-variance-authority"],
  registryDependencies: ["cn", "toggle-group"],
  aliases: {
    components: "@/components",
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [
    "border-default",
    "border-subtle",
    "fg-primary",
    "surface-secondary",
    "surface-selected",
  ],
  accessibility: {
    status: "audited",
    wcagLevel: "2.2-AA",
    interactive: true,
    keyboardTested: true,
    focusManaged: true,
    notes:
      "Audited, with one limit stated plainly. Role=group, aria-pressed, roving tabindex and Arrow-key traversal all come from Base UI's ToggleGroup composite, and NONE of them are observable under happy-dom — a raw <ToggleGroup> with no QPMatrix wrapper shows the same tabindex=-1 on every item, so the tests cannot prove Tab reaches the group or that arrows move between segments. Those are on the manual list and must be checked in the Storybook story with a real keyboard. What IS proven here: a focused segment activates by keyboard, reports exactly one value, and never reports an empty selection (the never-empty single-select rule this component adds, unit-tested via qpNextSegmentedValue). The consumer MUST name the root with aria-label or aria-labelledby — a role=group with no name is announced as nothing.",
  },
  supportedPlatforms: ["web"],
  tags: ["forms", "navigation"],
};

import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Ordered progress steps: label, optional description, completed/current/upcoming state. */
export const steps: QpRegistryItem = {
  name: "steps",
  type: "component",
  description:
    "Ordered progress steps: label, optional description, completed/current/upcoming state.",
  version: "0.1.0",
  files: [
    { path: "packages/ui/src/components/steps/steps.tsx" },
    { path: "packages/ui/src/components/steps/steps.types.ts" },
    { path: "packages/ui/src/components/steps/steps.constants.ts" },
    { path: "packages/ui/src/components/steps/steps.utils.ts" },
  ],
  dependencies: ["class-variance-authority", "lucide-react"],
  registryDependencies: ["cn", "button"],
  aliases: {
    components: "@/components",
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [
    "brand-foreground",
    "brand-primary",
    "fg-muted",
    "fg-primary",
    "radius-full",
    "surface-primary",
    "surface-secondary",
  ],
  accessibility: {
    status: "audited",
    wcagLevel: "2.2-AA",
    interactive: true,
    keyboardTested: true,
    focusManaged: false,
    notes:
      'Audited. Exactly one step carries aria-current="step"; completed and current state are ' +
      "each backed by a screen-reader-only text suffix in addition to the check glyph / ring, so " +
      "state is never colour alone (SC 1.4.1). Completed steps render as real <button>s (never " +
      "links) only when onStepClick is passed, keyboard-tested via Enter activation. Not a wizard: " +
      "renders progress only, owns no navigation state.",
  },
  supportedPlatforms: ["web"],
  tags: ["navigation", "progress"],
};

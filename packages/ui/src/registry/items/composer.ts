import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Chat message input with label, hint/error wiring and Enter-to-send. */
export const composer: QpRegistryItem = {
  name: "composer",
  type: "component",
  description: "Chat message input with label, hint/error wiring and Enter-to-send.",
  version: "0.1.0",
  files: [
    { path: "packages/ui/src/components/composer/composer.tsx" },
    { path: "packages/ui/src/components/composer/composer.types.ts" },
    { path: "packages/ui/src/components/composer/composer.constants.ts" },
    { path: "packages/ui/src/components/composer/composer.utils.ts" },
  ],
  dependencies: ["class-variance-authority"],
  registryDependencies: ["button", "cn", "textarea"],
  aliases: {
    components: "@/components",
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [
    "border-default",
    "border-focus",
    "fg-muted",
    "fg-secondary",
    "radius-xl",
    "status-error",
    "surface-primary",
  ],
  accessibility: {
    status: "audited",
    wcagLevel: "2.2-AA",
    interactive: true,
    keyboardTested: true,
    focusManaged: false,
    notes:
      "Audited. The field always has a real <label> wired by htmlFor, never a placeholder alone (SC 3.3.2). Errors set aria-invalid, are announced through role=alert, and replace the hint as the field's description so AT reads one authoritative message (SC 3.3.1). Submission is a real form submit, so implicit submission and voice control both work. Enter-to-send is suppressed during IME composition, which otherwise sends half-typed CJK input.",
  },
  supportedPlatforms: ["web"],
  tags: ["chat", "forms"],
};

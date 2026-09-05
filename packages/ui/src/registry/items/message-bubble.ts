import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** A single chat message, named by its author for assistive technology. */
export const messageBubble: QpRegistryItem = {
  name: "message-bubble",
  type: "component",
  description: "A single chat message, named by its author for assistive technology.",
  version: "0.1.0",
  files: [
    { path: "packages/ui/src/components/message-bubble/message-bubble.tsx" },
    { path: "packages/ui/src/components/message-bubble/message-bubble.types.ts" },
    { path: "packages/ui/src/components/message-bubble/message-bubble.constants.ts" },
    { path: "packages/ui/src/components/message-bubble/message-bubble.utils.ts" },
  ],
  dependencies: ["class-variance-authority"],
  registryDependencies: ["cn"],
  aliases: {
    components: "@/components",
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [
    "border-strong",
    "border-subtle",
    "brand-foreground",
    "brand-strong",
    "elevation-flat",
    "fg-primary",
    "fg-secondary",
    "radius-lg",
    "radius-md",
    "surface-secondary",
    "surface-tertiary",
  ],
  accessibility: {
    status: "audited",
    wcagLevel: "2.2-AA",
    interactive: false,
    keyboardTested: false,
    focusManaged: false,
    notes:
      "Audited. Rendered as an <article> named by a visually hidden author label, so AT announces who spoke before the body — sighted users get the same information from the colour role AND the inline alignment, so neither channel is load-bearing alone (SC 1.4.1). Alignment uses logical margins, so RTL needs no fork. Pending state sets aria-busy and announces an overridable label.",
  },
  supportedPlatforms: ["web"],
  tags: ["chat", "display"],
};

import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Animated typing affordance backed by a polite live region. */
export const typingIndicator: QpRegistryItem = {
  name: "typing-indicator",
  type: "component",
  description: "Animated typing affordance backed by a polite live region.",
  version: "0.1.0",
  files: [
    { path: "packages/ui/src/components/typing-indicator/typing-indicator.tsx" },
    { path: "packages/ui/src/components/typing-indicator/typing-indicator.types.ts" },
    { path: "packages/ui/src/components/typing-indicator/typing-indicator.constants.ts" },
    { path: "packages/ui/src/components/typing-indicator/typing-indicator.utils.ts" },
  ],
  dependencies: ["class-variance-authority"],
  registryDependencies: ["cn"],
  aliases: {
    components: "@/components",
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [
    "duration-fast",
    "duration-instant",
    "duration-slow",
    "fg-muted",
    "radius-full",
    "radius-lg",
    "radius-md",
    "surface-secondary",
  ],
  accessibility: {
    status: "audited",
    wcagLevel: "2.2-AA",
    interactive: false,
    keyboardTested: false,
    focusManaged: false,
    notes:
      "Audited. The dots are decorative (aria-hidden); the state is carried by a role=status live region containing a visually hidden, overridable label, so a screen-reader user is told the assistant is composing without seeing the animation. The bounce is motion-safe: only (SC 2.3.3).",
  },
  supportedPlatforms: ["web"],
  tags: ["chat", "feedback"],
};

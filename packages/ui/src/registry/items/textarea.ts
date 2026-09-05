import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Multi-line text input with the same field styling as `input`. */
export const textarea: QpRegistryItem = {
  name: "textarea",
  type: "primitive",
  description: "Multi-line text input with the same field styling as `input`.",
  version: "0.1.0",
  files: [
    {
      path: "packages/ui/src/components/ui/textarea.tsx",
    },
  ],
  dependencies: [],
  registryDependencies: ["cn"],
  aliases: {
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [
    "border-focus",
    "border-interactive",
    "fg-muted",
    "radius-lg",
    "status-error",
  ],
  accessibility: {
    status: "partial",
    wcagLevel: "2.2-AA",
    interactive: true,
    keyboardTested: true,
    focusManaged: false,
    notes:
      "Installed unmodified from shadcn/ui on Base UI. Keyboard and ARIA behaviour is owned and tested upstream by Base UI; QPMatrix has not yet run its own audit against docs/standards/accessibility.md.",
  },
  supportedPlatforms: ["web"],
  tags: ["forms", "input"],
};

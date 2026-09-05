import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Base UI single-line text input. */
export const input: QpRegistryItem = {
  name: "input",
  type: "primitive",
  description: "Base UI single-line text input.",
  version: "0.1.0",
  files: [
    {
      path: "packages/ui/src/components/ui/input.tsx",
    },
  ],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["cn"],
  aliases: {
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [
    "border-focus",
    "border-interactive",
    "fg-muted",
    "fg-primary",
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

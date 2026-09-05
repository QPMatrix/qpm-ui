import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Base UI tabs with list, trigger, and panel parts and roving focus. */
export const tabs: QpRegistryItem = {
  name: "tabs",
  type: "primitive",
  description: "Base UI tabs with list, trigger, and panel parts and roving focus.",
  version: "0.1.0",
  files: [
    {
      path: "packages/ui/src/components/ui/tabs.tsx",
    },
  ],
  dependencies: ["@base-ui/react", "class-variance-authority"],
  registryDependencies: ["cn"],
  aliases: {
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [
    "bg-canvas",
    "border-focus",
    "border-interactive",
    "fg-muted",
    "fg-primary",
    "radius-lg",
    "radius-md",
    "radius-none",
    "surface-tertiary",
  ],
  accessibility: {
    status: "partial",
    wcagLevel: "2.2-AA",
    interactive: true,
    keyboardTested: true,
    focusManaged: true,
    notes:
      "Installed unmodified from shadcn/ui on Base UI. Keyboard and ARIA behaviour is owned and tested upstream by Base UI; QPMatrix has not yet run its own audit against docs/standards/accessibility.md.",
  },
  supportedPlatforms: ["web"],
  tags: ["layout", "navigation"],
};

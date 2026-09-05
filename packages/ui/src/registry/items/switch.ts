import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Base UI switch for immediate on/off settings. */
export const switchItem: QpRegistryItem = {
  name: "switch",
  type: "primitive",
  description: "Base UI switch for immediate on/off settings.",
  version: "0.1.0",
  files: [
    {
      path: "packages/ui/src/components/ui/switch.tsx",
    },
  ],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["cn"],
  aliases: {
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [
    "bg-canvas",
    "border-focus",
    "border-interactive",
    "brand-foreground",
    "brand-strong",
    "fg-primary",
    "radius-full",
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

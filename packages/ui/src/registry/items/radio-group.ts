import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Base UI radio group and radio item with roving focus across the group. */
export const radioGroup: QpRegistryItem = {
  name: "radio-group",
  type: "primitive",
  description: "Base UI radio group and radio item with roving focus across the group.",
  version: "0.1.0",
  files: [
    {
      path: "packages/ui/src/components/ui/radio-group.tsx",
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
    "brand-foreground",
    "brand-strong",
    "radius-full",
    "status-error",
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
  tags: ["forms", "input"],
};

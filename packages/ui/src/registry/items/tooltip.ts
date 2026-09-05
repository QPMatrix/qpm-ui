import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Base UI tooltip with provider, trigger, positioner, and popup parts. */
export const tooltip: QpRegistryItem = {
  name: "tooltip",
  type: "primitive",
  description: "Base UI tooltip with provider, trigger, positioner, and popup parts.",
  version: "0.1.0",
  files: [
    {
      path: "packages/ui/src/components/ui/tooltip.tsx",
    },
  ],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["cn"],
  aliases: {
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: ["bg-canvas", "fg-primary", "radius-md", "radius-sm"],
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
  tags: ["feedback", "overlay"],
};

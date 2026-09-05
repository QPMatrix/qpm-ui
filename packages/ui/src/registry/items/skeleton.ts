import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Loading placeholder block that mirrors the shape of the content it replaces. */
export const skeleton: QpRegistryItem = {
  name: "skeleton",
  type: "primitive",
  description: "Loading placeholder block that mirrors the shape of the content it replaces.",
  version: "0.1.0",
  files: [
    {
      path: "packages/ui/src/components/ui/skeleton.tsx",
    },
  ],
  dependencies: [],
  registryDependencies: ["cn"],
  aliases: {
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: ["radius-md", "surface-tertiary"],
  accessibility: {
    status: "partial",
    wcagLevel: "2.2-AA",
    interactive: false,
    keyboardTested: false,
    focusManaged: false,
    notes:
      "Installed unmodified from shadcn/ui on Base UI. Keyboard and ARIA behaviour is owned and tested upstream by Base UI; QPMatrix has not yet run its own audit against docs/standards/accessibility.md.",
  },
  supportedPlatforms: ["web"],
  tags: ["feedback", "loading"],
};

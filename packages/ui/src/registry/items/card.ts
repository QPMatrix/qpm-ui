import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Card shell with header, title, description, action, content, and footer sub-components. */
export const card: QpRegistryItem = {
  name: "card",
  type: "primitive",
  description:
    "Card shell with header, title, description, action, content, and footer sub-components.",
  version: "0.1.0",
  files: [
    {
      path: "packages/ui/src/components/ui/card.tsx",
    },
  ],
  dependencies: [],
  registryDependencies: ["cn"],
  aliases: {
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: ["fg-muted", "fg-primary", "radius-xl", "surface-primary", "surface-tertiary"],
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
  tags: ["layout", "surface"],
};

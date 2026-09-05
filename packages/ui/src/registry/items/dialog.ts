import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Base UI modal dialog with backdrop, close button, and header/footer sub-components. */
export const dialog: QpRegistryItem = {
  name: "dialog",
  type: "primitive",
  description:
    "Base UI modal dialog with backdrop, close button, and header/footer sub-components.",
  version: "0.1.0",
  files: [
    {
      path: "packages/ui/src/components/ui/dialog.tsx",
    },
  ],
  dependencies: ["@base-ui/react", "lucide-react"],
  registryDependencies: ["button", "cn"],
  aliases: {
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [
    "fg-muted",
    "fg-primary",
    "radius-xl",
    "surface-secondary",
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
  tags: ["modal", "overlay"],
};

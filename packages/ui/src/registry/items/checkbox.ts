import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Base UI checkbox with checked, unchecked, and indeterminate states. */
export const checkbox: QpRegistryItem = {
  name: "checkbox",
  type: "primitive",
  description: "Base UI checkbox with checked, unchecked, and indeterminate states.",
  version: "0.1.0",
  files: [
    {
      path: "packages/ui/src/components/ui/checkbox.tsx",
    },
  ],
  dependencies: ["@base-ui/react", "lucide-react"],
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

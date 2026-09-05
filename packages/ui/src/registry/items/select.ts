import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Base UI select with trigger, positioner, popup, item, group, and separator parts. */
export const select: QpRegistryItem = {
  name: "select",
  type: "primitive",
  description: "Base UI select with trigger, positioner, popup, item, group, and separator parts.",
  version: "0.1.0",
  files: [
    {
      path: "packages/ui/src/components/ui/select.tsx",
    },
  ],
  dependencies: ["@base-ui/react", "lucide-react"],
  registryDependencies: ["cn"],
  aliases: {
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [
    "border-default",
    "border-focus",
    "border-interactive",
    "fg-muted",
    "fg-primary",
    "radius-lg",
    "radius-md",
    "status-error",
    "surface-interactive",
    "surface-secondary",
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
  tags: ["forms", "input", "overlay"],
};

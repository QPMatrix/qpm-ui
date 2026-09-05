import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Alert surface with title, description, and an optional trailing action slot, in default and destructive variants. */
export const alert: QpRegistryItem = {
  name: "alert",
  type: "primitive",
  description:
    "Alert surface with title, description, and an optional trailing action slot, in default and destructive variants.",
  version: "0.1.0",
  files: [
    {
      path: "packages/ui/src/components/ui/alert.tsx",
    },
  ],
  dependencies: ["class-variance-authority"],
  registryDependencies: ["cn"],
  aliases: {
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: ["fg-muted", "fg-primary", "radius-lg", "status-error", "surface-primary"],
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
  tags: ["feedback", "status"],
};

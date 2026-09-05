import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Compact status/label badge rendered through Base UI's render prop, so it can become any element. */
export const badge: QpRegistryItem = {
  name: "badge",
  type: "primitive",
  description:
    "Compact status/label badge rendered through Base UI's render prop, so it can become any element.",
  version: "0.1.0",
  files: [
    {
      path: "packages/ui/src/components/ui/badge.tsx",
    },
  ],
  dependencies: ["@base-ui/react", "class-variance-authority"],
  registryDependencies: ["cn"],
  aliases: {
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [
    "border-default",
    "border-focus",
    "brand-foreground",
    "brand-primary",
    "brand-strong",
    "fg-muted",
    "fg-primary",
    "status-error",
    "surface-tertiary",
  ],
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
  tags: ["data-display", "status"],
};

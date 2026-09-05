import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Base UI two-state toggle button. */
export const toggle: QpRegistryItem = {
  name: "toggle",
  type: "primitive",
  description: "Base UI two-state toggle button.",
  version: "0.1.0",
  files: [
    {
      path: "packages/ui/src/components/ui/toggle.tsx",
    },
  ],
  dependencies: ["@base-ui/react", "class-variance-authority"],
  registryDependencies: ["cn"],
  aliases: {
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [
    "border-focus",
    "border-interactive",
    "fg-primary",
    "radius-lg",
    "radius-md",
    "status-error",
    "surface-tertiary",
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
  tags: ["action", "forms"],
};

import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Base UI toggle group with single or multiple selection and roving focus. */
export const toggleGroup: QpRegistryItem = {
  name: "toggle-group",
  type: "primitive",
  description: "Base UI toggle group with single or multiple selection and roving focus.",
  version: "0.1.0",
  files: [
    {
      path: "packages/ui/src/components/ui/toggle-group.tsx",
    },
  ],
  dependencies: ["@base-ui/react", "class-variance-authority"],
  registryDependencies: ["cn", "toggle"],
  aliases: {
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: ["radius-lg", "radius-md", "radius-none"],
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
  tags: ["action", "forms"],
};

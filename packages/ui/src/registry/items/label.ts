import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Form label bound to its control, with disabled-state styling. */
export const label: QpRegistryItem = {
  name: "label",
  type: "primitive",
  description: "Form label bound to its control, with disabled-state styling.",
  version: "0.1.0",
  files: [
    {
      path: "packages/ui/src/components/ui/label.tsx",
    },
  ],
  dependencies: [],
  registryDependencies: ["cn"],
  aliases: {
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [],
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
  tags: ["forms"],
};

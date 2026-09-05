import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Form field scaffolding: label, description, error, group, set, legend, and separator parts that wire labelling and validation messaging together. */
export const field: QpRegistryItem = {
  name: "field",
  type: "primitive",
  description:
    "Form field scaffolding: label, description, error, group, set, legend, and separator parts that wire labelling and validation messaging together.",
  version: "0.1.0",
  files: [
    {
      path: "packages/ui/src/components/ui/field.tsx",
    },
  ],
  dependencies: ["class-variance-authority"],
  registryDependencies: ["cn", "label", "separator"],
  aliases: {
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [
    "bg-canvas",
    "brand-primary",
    "brand-strong",
    "fg-muted",
    "radius-lg",
    "status-error",
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
  tags: ["forms", "layout"],
};

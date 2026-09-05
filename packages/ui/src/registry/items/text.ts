import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Every piece of text in a QPMatrix surface: the whole type ramp as one prop. */
export const text: QpRegistryItem = {
  name: "text",
  type: "component",
  description: "Every piece of text in a QPMatrix surface: the whole type ramp as one prop.",
  version: "0.1.0",
  files: [
    { path: "packages/ui/src/components/text/text.tsx" },
    { path: "packages/ui/src/components/text/text.types.ts" },
    { path: "packages/ui/src/components/text/text.constants.ts" },
    { path: "packages/ui/src/components/text/text.utils.ts" },
  ],
  dependencies: [],
  registryDependencies: ["cn"],
  aliases: {
    components: "@/components",
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [
    "brand-primary",
    "fg-inverse",
    "fg-muted",
    "fg-primary",
    "fg-secondary",
    "fg-subtle",
    "font-arabic",
    "font-display",
    "font-hebrew",
    "font-mono",
    "font-sans",
    "status-error",
    "status-info",
    "status-success",
    "status-warning",
  ],
  accessibility: {
    status: "audited",
    wcagLevel: "2.2-AA",
    interactive: false,
    keyboardTested: false,
    focusManaged: false,
    notes:
      "Audited. Separates the type step (`variant`) from the element (`as`) so a visual heading cannot silently become a document heading — conflating them is how a page ends up with an outline no screen-reader user can navigate (SC 1.3.1). Ships script-specific font families with the size and line-height adjustments @qpmatrix/tokens defines.",
  },
  supportedPlatforms: ["web"],
  tags: ["typography"],
};

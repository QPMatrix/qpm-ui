import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Brand chip naming a QPMatrix product surface, with a token-role tone. */
export const productBadge: QpRegistryItem = {
  name: "product-badge",
  type: "component",
  description: "Brand chip naming a QPMatrix product surface, with a token-role tone.",
  version: "0.1.0",
  files: [
    { path: "packages/ui/src/components/product-badge/product-badge.tsx" },
    { path: "packages/ui/src/components/product-badge/product-badge.types.ts" },
    { path: "packages/ui/src/components/product-badge/product-badge.constants.ts" },
    { path: "packages/ui/src/components/product-badge/product-badge.utils.ts" },
  ],
  dependencies: ["class-variance-authority"],
  registryDependencies: ["badge", "cn"],
  aliases: {
    components: "@/components",
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [
    "brand-subtle",
    "fg-primary",
    "fg-secondary",
    "status-info-bg",
    "status-success-bg",
    "status-warning-bg",
    "surface-interactive",
    "surface-secondary",
    "surface-tertiary",
  ],
  accessibility: {
    status: "audited",
    wcagLevel: "2.2-AA",
    interactive: false,
    keyboardTested: false,
    focusManaged: false,
    notes:
      "Audited. The product name is always rendered as text and the tone is a redundant cue, so meaning never rests on colour alone (SC 1.4.1). Non-interactive: it renders no focusable element of its own unless the caller supplies one via `render`.",
  },
  supportedPlatforms: ["web"],
  tags: ["brand", "display"],
};

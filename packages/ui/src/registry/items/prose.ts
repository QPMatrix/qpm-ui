import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** The surface authored Markdown/MDX is rendered on, styled from tokens. */
export const prose: QpRegistryItem = {
  name: "prose",
  type: "component",
  description: "The surface authored Markdown/MDX is rendered on, styled from tokens.",
  version: "0.1.0",
  files: [
    { path: "packages/ui/src/components/prose/prose.tsx" },
    { path: "packages/ui/src/components/prose/prose.types.ts" },
    { path: "packages/ui/src/components/prose/prose.constants.ts" },
    { path: "packages/ui/src/components/prose/prose.utils.tsx" },
  ],
  dependencies: [],
  registryDependencies: ["cn", "heading", "text"],
  aliases: {
    components: "@/components",
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [
    "border-default",
    "border-interactive",
    "border-subtle",
    "brand-primary",
    "fg-muted",
    "fg-primary",
    "fg-secondary",
    "font-display",
    "font-mono",
    "radius-lg",
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
      "Audited. Styles compiler-emitted HTML from token roles only. Links carry an underline as well as a colour, so a link inside body text is not identified by colour alone (SC 1.4.1). Headings carry scroll margin so an in-page anchor does not land under a sticky header. List indentation and quote borders use logical properties, so RTL content needs no second stylesheet.",
  },
  supportedPlatforms: ["web"],
  tags: ["content", "typography"],
};

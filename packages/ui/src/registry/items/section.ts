import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** A titled block of a page that is a landmark only when it has an accessible name. */
export const section: QpRegistryItem = {
  name: "section",
  type: "component",
  description: "A titled block of a page that is a landmark only when it has an accessible name.",
  version: "0.1.0",
  files: [
    { path: "packages/ui/src/components/section/section.tsx" },
    { path: "packages/ui/src/components/section/section.types.ts" },
    { path: "packages/ui/src/components/section/section.constants.ts" },
    { path: "packages/ui/src/components/section/section.utils.ts" },
  ],
  dependencies: [],
  registryDependencies: ["cn", "heading", "reveal", "text"],
  aliases: {
    components: "@/components",
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: ["brand-subtle", "elevation-raised", "surface-primary", "surface-secondary"],
  accessibility: {
    status: "audited",
    wcagLevel: "2.2-AA",
    interactive: false,
    keyboardTested: false,
    focusManaged: false,
    notes:
      "Audited. Renders a `<section>` ONLY when it has an accessible name, from a visible heading or an explicit label; an unnamed section is exposed as an anonymous group, implying navigable structure that is not there, so it is downgraded to a div instead (SC 1.3.1, SC 2.4.1). The heading's outline level is a prop.",
  },
  supportedPlatforms: ["web"],
  tags: ["layout"],
};

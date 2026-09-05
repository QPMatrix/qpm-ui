import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** The measure a page is written inside: reading width and vertical rhythm. */
export const pageContainer: QpRegistryItem = {
  name: "page-container",
  type: "component",
  description: "The measure a page is written inside: reading width and vertical rhythm.",
  version: "0.1.0",
  files: [
    { path: "packages/ui/src/components/page-container/page-container.tsx" },
    { path: "packages/ui/src/components/page-container/page-container.types.ts" },
    { path: "packages/ui/src/components/page-container/page-container.constants.ts" },
    { path: "packages/ui/src/components/page-container/page-container.utils.ts" },
  ],
  dependencies: [],
  registryDependencies: ["cn", "motion"],
  aliases: {
    components: "@/components",
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [],
  accessibility: {
    status: "audited",
    wcagLevel: "2.2-AA",
    interactive: false,
    keyboardTested: false,
    focusManaged: false,
    notes:
      "Audited. Defaults to a div, so the page's single `main` landmark is an explicit opt-in — two `main` elements make the 'skip to content' shortcut ambiguous, and none at all forces a screen-reader user through the navigation on every visit (SC 2.4.1).",
  },
  supportedPlatforms: ["web"],
  tags: ["layout"],
};

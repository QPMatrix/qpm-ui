import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Orchestrate children so they arrive in sequence. */
export const stagger: QpRegistryItem = {
  name: "stagger",
  type: "component",
  description: "Orchestrate children so they arrive in sequence.",
  version: "0.1.0",
  files: [
    {
      path: "packages/ui/src/components/stagger/stagger.constants.ts",
    },
    {
      path: "packages/ui/src/components/stagger/stagger.tsx",
    },
    {
      path: "packages/ui/src/components/stagger/stagger.types.ts",
    },
    {
      path: "packages/ui/src/components/stagger/stagger.utils.ts",
    },
  ],
  dependencies: ["motion"],
  registryDependencies: ["cn", "motion-core"],
  aliases: {
    components: "@/components",
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [],
  accessibility: {
    status: "audited",
    wcagLevel: "2.2-AA",
    interactive: true,
    keyboardTested: true,
    focusManaged: false,
    notes:
      "Audited. Under reduced motion the stagger step collapses to zero, so every child still appears — just simultaneously, with no sweep down the page (SC 2.3.3). Renders the element the document needs, so a staggered list is still a real list.",
  },
  supportedPlatforms: ["web"],
  tags: ["motion"],
};

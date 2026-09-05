import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Animate an element in as it scrolls into view, once by default. */
export const reveal: QpRegistryItem = {
  name: "reveal",
  type: "component",
  description: "Animate an element in as it scrolls into view, once by default.",
  version: "0.1.0",
  files: [
    {
      path: "packages/ui/src/components/reveal/reveal.constants.ts",
    },
    {
      path: "packages/ui/src/components/reveal/reveal.tsx",
    },
    {
      path: "packages/ui/src/components/reveal/reveal.types.ts",
    },
    {
      path: "packages/ui/src/components/reveal/reveal.utils.ts",
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
      "Audited. Same reduced-motion guarantee as QPMotion. Plays once by default — replaying on viewport re-entry makes a page feel unstable and punishes a reader for scrolling back (SC 2.3.3).",
  },
  supportedPlatforms: ["web"],
  tags: ["motion"],
};

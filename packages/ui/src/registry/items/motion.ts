import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Animate an element in and out where it stands, with reduced-motion handling. */
export const motion: QpRegistryItem = {
  name: "motion",
  type: "component",
  description: "Animate an element in and out where it stands, with reduced-motion handling.",
  version: "0.1.0",
  files: [
    {
      path: "packages/ui/src/components/motion/motion.constants.ts",
    },
    {
      path: "packages/ui/src/components/motion/motion.tsx",
    },
    {
      path: "packages/ui/src/components/motion/motion.types.ts",
    },
    {
      path: "packages/ui/src/components/motion/motion.utils.ts",
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
      "Audited. Calls useReducedMotion() and strips every transform under `prefers-reduced-motion: reduce`, keeping only a cross-fade so no content is lost (SC 2.3.3). Renders no interactive element of its own; `as` is restricted so an animated wrapper cannot silently replace a semantic element.",
  },
  supportedPlatforms: ["web"],
  tags: ["motion"],
};

import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** The QPMatrix motion vocabulary: token durations, easings, springs, named variants and the reduced-motion reducer. */
export const motionCore: QpRegistryItem = {
  name: "motion-core",
  type: "utility",
  description:
    "The QPMatrix motion vocabulary: token durations, easings, springs, named variants and the reduced-motion reducer.",
  version: "0.1.0",
  files: [
    { path: "packages/ui/src/lib/motion/motion-core.constants.ts" },
    { path: "packages/ui/src/lib/motion/motion-core.elements.ts" },
    { path: "packages/ui/src/lib/motion/motion-core.types.ts" },
    { path: "packages/ui/src/lib/motion/motion-core.utils.ts" },
  ],
  dependencies: ["motion"],
  registryDependencies: [],
  aliases: {
    lib: "@/lib",
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
      "Non-rendering module, but it is where the accessibility guarantee of the whole motion system lives: `qpReduceVariants` strips every transform and size change from a variant set under `prefers-reduced-motion: reduce`, keeping only opacity so a cross-fade still signals arrival without vestibular motion (SC 2.3.3). Its behaviour is asserted directly in the motion components' tests rather than only through rendering.",
  },
  supportedPlatforms: ["web"],
  tags: ["motion", "utility"],
};

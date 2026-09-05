import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** A heading whose document-outline level is a stated prop, never inferred from its size. */
export const heading: QpRegistryItem = {
  name: "heading",
  type: "component",
  description:
    "A heading whose document-outline level is a stated prop, never inferred from its size.",
  version: "0.1.0",
  files: [
    { path: "packages/ui/src/components/heading/heading.tsx" },
    { path: "packages/ui/src/components/heading/heading.types.ts" },
    { path: "packages/ui/src/components/heading/heading.constants.ts" },
    { path: "packages/ui/src/components/heading/heading.utils.ts" },
  ],
  dependencies: [],
  registryDependencies: ["cn", "text"],
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
      "Audited. `level` is required and drives the tag, so the document outline is stated rather than inferred from type size (SC 1.3.1). `plain` is the explicit escape hatch for text that only looks like a heading, keeping the outline free of a hundred card titles.",
  },
  supportedPlatforms: ["web"],
  tags: ["typography"],
};

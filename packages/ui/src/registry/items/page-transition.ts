import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Cross-fade a whole route, holding the outgoing page until it has left. */
export const pageTransition: QpRegistryItem = {
  name: "page-transition",
  type: "component",
  description: "Cross-fade a whole route, holding the outgoing page until it has left.",
  version: "0.1.0",
  files: [
    {
      path: "packages/ui/src/components/page-transition/page-transition.constants.ts",
    },
    {
      path: "packages/ui/src/components/page-transition/page-transition.tsx",
    },
    {
      path: "packages/ui/src/components/page-transition/page-transition.types.ts",
    },
    {
      path: "packages/ui/src/components/page-transition/page-transition.utils.ts",
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
      "Audited. Cross-fade only, no movement, and suppressed on first paint so a hard load is not delayed. `initial={false}` also avoids a flash of correctly-rendered-then-hidden content on a server-rendered app.",
  },
  supportedPlatforms: ["web"],
  tags: ["motion"],
};

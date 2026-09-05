import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Square icon-only button composing ui/button, with a required accessible name. */
export const iconButton: QpRegistryItem = {
  name: "icon-button",
  type: "component",
  description: "Square icon-only button composing ui/button, with a required accessible name.",
  version: "0.1.0",
  files: [
    { path: "packages/ui/src/components/icon-button/icon-button.tsx" },
    { path: "packages/ui/src/components/icon-button/icon-button.types.ts" },
    { path: "packages/ui/src/components/icon-button/icon-button.constants.ts" },
    { path: "packages/ui/src/components/icon-button/icon-button.utils.ts" },
  ],
  dependencies: ["class-variance-authority"],
  registryDependencies: ["button", "cn"],
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
      "Audited against docs/standards/accessibility.md. `label` is required and applied as aria-label after the prop spread, so an icon-only control can never ship unnamed (SC 4.1.2). Keyboard reachability, Enter/Space activation, disabled semantics and the focus-visible ring are inherited from ui/button and covered by icon-button.test.tsx.",
  },
  supportedPlatforms: ["web"],
  tags: ["action", "icon"],
};

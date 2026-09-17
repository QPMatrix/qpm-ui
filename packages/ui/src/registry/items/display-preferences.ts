import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Text size, reduced motion and colour scheme controls, persisted per viewer. */
export const displayPreferences: QpRegistryItem = {
  name: "display-preferences",
  type: "component",
  description: "Text size, reduced motion and colour scheme controls, persisted per viewer.",
  version: "0.1.0",
  files: [
    { path: "packages/ui/src/components/display-preferences/display-preferences.tsx" },
    { path: "packages/ui/src/components/display-preferences/display-preferences.types.ts" },
    { path: "packages/ui/src/components/display-preferences/display-preferences.constants.ts" },
    { path: "packages/ui/src/components/display-preferences/display-preferences.utils.ts" },
  ],
  dependencies: [],
  registryDependencies: [
    "cn",
    "field",
    "label",
    "switch",
    "segmented-control",
    "motion-core",
    "theme-contract",
  ],
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
      "Audited. A <fieldset>/<legend> names the panel as a labelled group (SC 1.3.1); every " +
      "row has its own visible label, associated by aria-labelledby (segmented rows) or " +
      "a real <label for> (the switch). Text size applies as a root style.fontSize " +
      'percentage. Reduced motion sets data-qp-reduced-motion="reduce" on the root, which ' +
      "lib/motion's useQpRootReducedMotion reads live — every QPMatrix motion component " +
      "(QPMotion/QPReveal/QPStagger/QPPageTransition) honours it immediately. Colour scheme " +
      'resolves "system" against prefers-color-scheme before handing a concrete mode to ' +
      "../../lib/theme's themeAttributes — applied through the existing two-mode contract, " +
      "never with ad-hoc classes. Persistence is a guarded localStorage adapter by default " +
      "(read/write both try/catch), and the component additionally guards a caller-supplied " +
      "adapter defensively, so it renders correctly when storage throws either way — " +
      "keyboard-tested via Space (switch) and click/Enter (segmented controls, inherited).",
  },
  supportedPlatforms: ["web"],
  tags: ["form", "preferences", "theme"],
};

import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Server-driven theme contract: approved modes and accents, selection narrowing, and the DOM attributes that apply a selection. */
export const themeContract: QpRegistryItem = {
  name: "theme-contract",
  type: "utility",
  description:
    "Server-driven theme contract: approved modes and accents, selection narrowing, and the DOM attributes that apply a selection.",
  version: "0.1.0",
  files: [
    {
      path: "packages/ui/src/lib/theme.ts",
    },
  ],
  dependencies: ["@qpmtx/tokens"],
  registryDependencies: [],
  aliases: {
    lib: "@/lib",
    utils: "@/lib/utils",
  },
  tokenDependencies: [],
  accessibility: {
    status: "not-applicable",
    wcagLevel: "2.2-AA",
    interactive: false,
    keyboardTested: false,
    focusManaged: false,
    notes:
      "Non-rendering module: it produces no DOM of its own, so there is no accessibility surface to audit.",
  },
  supportedPlatforms: ["web", "react-native", "desktop", "server"],
  tags: ["theming", "utility"],
};

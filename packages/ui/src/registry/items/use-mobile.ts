import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Viewport media-query hook backing the sidebar's mobile arrangement. */
export const useMobile: QpRegistryItem = {
  name: "use-mobile",
  type: "hook",
  description: "Viewport media-query hook backing the sidebar's mobile arrangement.",
  version: "0.1.0",
  files: [{ path: "packages/ui/src/hooks/use-mobile.ts" }],
  dependencies: [],
  registryDependencies: [],
  aliases: {
    hooks: "@/hooks",
    lib: "@/lib",
  },
  tokenDependencies: [],
  accessibility: {
    status: "not-applicable",
    wcagLevel: "2.2-AA",
    interactive: false,
    keyboardTested: false,
    focusManaged: false,
    notes:
      "Non-rendering module: it produces no DOM, so there is no accessibility surface to audit. It does affect one: `sidebar` uses it to choose between an inline sidebar and a drawer, and the hook's server snapshot deliberately reports desktop so hydration does not pop a drawer open under the user.",
  },
  supportedPlatforms: ["web"],
  tags: ["hook", "layout"],
};

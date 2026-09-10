import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** `lucide-react`, already a dependency of this package, re-exported as one tree-shakeable `QPIcon` namespace. */
export const icons: QpRegistryItem = {
  name: "icons",
  type: "utility",
  description:
    "`lucide-react`, already a dependency of this package, re-exported as one tree-shakeable `QPIcon` namespace.",
  version: "0.1.0",
  files: [{ path: "packages/ui/src/lib/icons.ts" }],
  dependencies: ["lucide-react"],
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
      "Non-rendering module: a namespace re-export produces no DOM of its own. Every icon it exposes is an inert SVG until a consumer gives it an accessible treatment at the call site (`aria-hidden` beside real text, or an accessible name when the icon is the only content) — that responsibility sits with the caller, the same as passing any icon element into `QPIconButton` or `EmptyMedia` today.",
  },
  supportedPlatforms: ["web"],
  tags: ["icons", "utility"],
};

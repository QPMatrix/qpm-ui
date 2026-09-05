import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Tailwind class merge helper: the single styling escape hatch every @qpmtx/ui component runs `className` through. */
export const cn: QpRegistryItem = {
  name: "cn",
  type: "utility",
  description:
    "Tailwind class merge helper: the single styling escape hatch every @qpmtx/ui component runs `className` through.",
  version: "0.1.0",
  files: [
    {
      path: "packages/ui/src/lib/utils.ts",
    },
  ],
  dependencies: ["clsx", "tailwind-merge"],
  registryDependencies: [],
  aliases: {
    lib: "@/lib",
    utils: "@/lib/utils",
  },
  tokenDependencies: ["fg-primary"],
  accessibility: {
    status: "not-applicable",
    wcagLevel: "2.2-AA",
    interactive: false,
    keyboardTested: false,
    focusManaged: false,
    notes:
      "Non-rendering module: it produces no DOM of its own, so there is no accessibility surface to audit.",
  },
  supportedPlatforms: ["web"],
  tags: ["styling", "utility"],
};

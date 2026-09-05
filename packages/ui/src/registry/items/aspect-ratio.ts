import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Base UI aspect ratio primitive, installed from shadcn/ui and bound to @qpmtx/tokens. Exports 1 symbol(s). */
export const aspectRatio: QpRegistryItem = {
  name: "aspect-ratio",
  type: "primitive",
  description:
    "Base UI aspect ratio primitive, installed from shadcn/ui and bound to @qpmtx/tokens. Exports 1 symbol(s).",
  version: "0.1.0",
  files: [{ path: "packages/ui/src/components/ui/aspect-ratio.tsx" }],
  dependencies: [],
  registryDependencies: ["cn"],
  aliases: {
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [],
  accessibility: {
    status: "partial",
    wcagLevel: "2.2-AA",
    interactive: false,
    keyboardTested: false,
    focusManaged: false,
    notes:
      'Installed unmodified from shadcn/ui on Base UI. Keyboard and ARIA behaviour is owned and tested upstream by Base UI; QPMatrix has not yet run its own audit against docs/standards/accessibility.md, so the status is "partial" rather than "audited". Its @qpmtx/ui colours resolve through styles/qpmatrix.css, so the token layer is already covered by bun run a11y:contrast.',
  },
  supportedPlatforms: ["web"],
  tags: ["layout"],
};

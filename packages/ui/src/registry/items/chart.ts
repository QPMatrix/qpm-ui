import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Base UI chart primitive, installed from shadcn/ui and bound to @qpmtx/tokens. Exports 6 symbol(s). */
export const chart: QpRegistryItem = {
  name: "chart",
  type: "primitive",
  description:
    "Base UI chart primitive, installed from shadcn/ui and bound to @qpmtx/tokens. Exports 6 symbol(s).",
  version: "0.1.0",
  files: [{ path: "packages/ui/src/components/ui/chart.tsx" }],
  dependencies: ["recharts"],
  registryDependencies: ["cn"],
  aliases: {
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [
    "bg-canvas",
    "border-default",
    "fg-muted",
    "fg-primary",
    "font-mono",
    "radius-lg",
    "surface-tertiary",
  ],
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
  tags: ["data-display"],
};

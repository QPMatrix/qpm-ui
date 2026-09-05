import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Base UI resizable primitive, installed from shadcn/ui and bound to @qpmatrix/tokens. Exports 3 symbol(s). */
export const resizable: QpRegistryItem = {
  name: "resizable",
  type: "primitive",
  description:
    "Base UI resizable primitive, installed from shadcn/ui and bound to @qpmatrix/tokens. Exports 3 symbol(s).",
  version: "0.1.0",
  files: [{ path: "packages/ui/src/components/ui/resizable.tsx" }],
  dependencies: ["react-resizable-panels"],
  registryDependencies: ["cn"],
  aliases: {
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: ["border-default", "border-focus", "radius-lg"],
  accessibility: {
    status: "partial",
    wcagLevel: "2.2-AA",
    interactive: true,
    keyboardTested: false,
    focusManaged: false,
    knownDefects: [
      {
        criterion: "2.1.1",
        summary:
          'The resize handle exposes `role="separator"` but is not keyboard-focusable, so a keyboard-only user cannot resize a panel at all. Verified by running axe against `primitives-layout-resizable--default` in Chrome.',
        owner: "react-resizable-panels",
      },
    ],
    notes:
      'Installed unmodified from shadcn/ui on Base UI. Its @qpmatrix/ui colours resolve through styles/qpmatrix.css, so the token layer is covered by bun run a11y:contrast. The recorded SC 2.1.1 defect belongs to react-resizable-panels, not to this package: do not mark this item "audited" until it is fixed upstream or the dependency is replaced.',
  },
  supportedPlatforms: ["web"],
  tags: ["layout"],
};

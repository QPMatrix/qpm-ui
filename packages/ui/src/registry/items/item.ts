import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Base UI item primitive, installed from shadcn/ui and bound to @qpmatrix/tokens. Exports 10 symbol(s). */
export const item: QpRegistryItem = {
  name: "item",
  type: "primitive",
  description:
    "Base UI item primitive, installed from shadcn/ui and bound to @qpmatrix/tokens. Exports 10 symbol(s).",
  version: "0.1.0",
  files: [{ path: "packages/ui/src/components/ui/item.tsx" }],
  dependencies: ["@base-ui/react", "class-variance-authority"],
  registryDependencies: ["cn", "separator"],
  aliases: {
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [
    "border-default",
    "border-focus",
    "brand-primary",
    "fg-muted",
    "radius-lg",
    "radius-sm",
    "surface-tertiary",
  ],
  accessibility: {
    status: "partial",
    wcagLevel: "2.2-AA",
    interactive: false,
    keyboardTested: false,
    focusManaged: false,
    notes:
      'Installed unmodified from shadcn/ui on Base UI. Keyboard and ARIA behaviour is owned and tested upstream by Base UI; QPMatrix has not yet run its own audit against docs/standards/accessibility.md, so the status is "partial" rather than "audited". Its @qpmatrix/ui colours resolve through styles/qpmatrix.css, so the token layer is already covered by bun run a11y:contrast.',
  },
  supportedPlatforms: ["web"],
  tags: ["display"],
};

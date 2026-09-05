import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Base UI sidebar primitive, installed from shadcn/ui and bound to @qpmatrix/tokens. Exports 24 symbol(s). */
export const sidebar: QpRegistryItem = {
  name: "sidebar",
  type: "primitive",
  description:
    "Base UI sidebar primitive, installed from shadcn/ui and bound to @qpmatrix/tokens. Exports 24 symbol(s).",
  version: "0.1.0",
  files: [{ path: "packages/ui/src/components/ui/sidebar.tsx" }],
  dependencies: ["@base-ui/react", "class-variance-authority", "lucide-react"],
  registryDependencies: [
    "button",
    "cn",
    "input",
    "separator",
    "sheet",
    "skeleton",
    "tooltip",
    "use-mobile",
  ],
  aliases: {
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [
    "bg-canvas",
    "border-focus",
    "border-subtle",
    "fg-primary",
    "radius-lg",
    "radius-md",
    "radius-xl",
    "surface-interactive",
    "surface-primary",
  ],
  accessibility: {
    status: "partial",
    wcagLevel: "2.2-AA",
    interactive: true,
    keyboardTested: true,
    focusManaged: true,
    notes:
      'Installed unmodified from shadcn/ui on Base UI. Keyboard and ARIA behaviour is owned and tested upstream by Base UI; QPMatrix has not yet run its own audit against docs/standards/accessibility.md, so the status is "partial" rather than "audited". Its @qpmatrix/ui colours resolve through styles/qpmatrix.css, so the token layer is already covered by bun run a11y:contrast.',
  },
  supportedPlatforms: ["web"],
  tags: ["navigation", "layout"],
};

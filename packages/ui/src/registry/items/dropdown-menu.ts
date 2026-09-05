import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Base UI dropdown menu primitive, installed from shadcn/ui and bound to @qpmatrix/tokens. Exports 15 symbol(s). */
export const dropdownMenu: QpRegistryItem = {
  name: "dropdown-menu",
  type: "primitive",
  description:
    "Base UI dropdown menu primitive, installed from shadcn/ui and bound to @qpmatrix/tokens. Exports 15 symbol(s).",
  version: "0.1.0",
  files: [{ path: "packages/ui/src/components/ui/dropdown-menu.tsx" }],
  dependencies: ["@base-ui/react", "lucide-react"],
  registryDependencies: ["cn"],
  aliases: {
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [
    "border-default",
    "fg-muted",
    "fg-primary",
    "radius-lg",
    "radius-md",
    "status-error",
    "surface-interactive",
    "surface-secondary",
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
  tags: ["overlay", "navigation"],
};

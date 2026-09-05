import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Base UI menubar primitive, installed from shadcn/ui and bound to @qpmtx/tokens. Exports 16 symbol(s). */
export const menubar: QpRegistryItem = {
  name: "menubar",
  type: "primitive",
  description:
    "Base UI menubar primitive, installed from shadcn/ui and bound to @qpmtx/tokens. Exports 16 symbol(s).",
  version: "0.1.0",
  files: [{ path: "packages/ui/src/components/ui/menubar.tsx" }],
  dependencies: ["@base-ui/react", "lucide-react"],
  registryDependencies: ["cn", "dropdown-menu"],
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
    "radius-sm",
    "status-error",
    "surface-interactive",
    "surface-secondary",
    "surface-tertiary",
  ],
  accessibility: {
    status: "partial",
    wcagLevel: "2.2-AA",
    interactive: true,
    keyboardTested: true,
    focusManaged: true,
    notes:
      'Installed unmodified from shadcn/ui on Base UI. Keyboard and ARIA behaviour is owned and tested upstream by Base UI; QPMatrix has not yet run its own audit against docs/standards/accessibility.md, so the status is "partial" rather than "audited". Its @qpmtx/ui colours resolve through styles/qpmatrix.css, so the token layer is already covered by bun run a11y:contrast.',
  },
  supportedPlatforms: ["web"],
  tags: ["navigation"],
};

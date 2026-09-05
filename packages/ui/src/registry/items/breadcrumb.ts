import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Base UI breadcrumb primitive, installed from shadcn/ui and bound to @qpmtx/tokens. Exports 7 symbol(s). */
export const breadcrumb: QpRegistryItem = {
  name: "breadcrumb",
  type: "primitive",
  description:
    "Base UI breadcrumb primitive, installed from shadcn/ui and bound to @qpmtx/tokens. Exports 7 symbol(s).",
  version: "0.1.0",
  files: [{ path: "packages/ui/src/components/ui/breadcrumb.tsx" }],
  dependencies: ["@base-ui/react", "lucide-react"],
  registryDependencies: ["cn"],
  aliases: {
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: ["fg-muted", "fg-primary"],
  accessibility: {
    status: "partial",
    wcagLevel: "2.2-AA",
    interactive: true,
    keyboardTested: true,
    focusManaged: false,
    notes:
      'Installed unmodified from shadcn/ui on Base UI. Keyboard and ARIA behaviour is owned and tested upstream by Base UI; QPMatrix has not yet run its own audit against docs/standards/accessibility.md, so the status is "partial" rather than "audited". Its @qpmtx/ui colours resolve through styles/qpmatrix.css, so the token layer is already covered by bun run a11y:contrast.',
  },
  supportedPlatforms: ["web"],
  tags: ["navigation"],
};

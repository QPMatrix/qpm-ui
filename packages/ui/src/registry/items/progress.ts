import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Base UI progress primitive, installed from shadcn/ui and bound to @qpmatrix/tokens. Exports 5 symbol(s). */
export const progress: QpRegistryItem = {
  name: "progress",
  type: "primitive",
  description:
    "Base UI progress primitive, installed from shadcn/ui and bound to @qpmatrix/tokens. Exports 5 symbol(s).",
  version: "0.1.0",
  files: [{ path: "packages/ui/src/components/ui/progress.tsx" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["cn"],
  aliases: {
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: ["brand-strong", "fg-muted", "radius-full", "surface-tertiary"],
  accessibility: {
    status: "partial",
    wcagLevel: "2.2-AA",
    interactive: false,
    keyboardTested: false,
    focusManaged: false,
    notes:
      'Installed unmodified from shadcn/ui on Base UI, so the status is "partial" rather than "audited"; its @qpmatrix/ui colours resolve through styles/qpmatrix.css and are covered by bun run a11y:contrast. CALLER OBLIGATION: a bare `<QPProgress value={n} />` renders a progressbar with no accessible name and announces nothing (SC 4.1.2). Every use site must pass `aria-label` or `aria-labelledby`. The component cannot enforce this without diverging from upstream, so it is the consumer\'s to get right.',
  },
  supportedPlatforms: ["web"],
  tags: ["feedback"],
};

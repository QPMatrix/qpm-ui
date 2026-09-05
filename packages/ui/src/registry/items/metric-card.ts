import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Labelled dashboard metric with an optional trend and loading state. */
export const metricCard: QpRegistryItem = {
  name: "metric-card",
  type: "component",
  description: "Labelled dashboard metric with an optional trend and loading state.",
  version: "0.1.0",
  files: [
    { path: "packages/ui/src/components/metric-card/metric-card.tsx" },
    { path: "packages/ui/src/components/metric-card/metric-card.types.ts" },
    { path: "packages/ui/src/components/metric-card/metric-card.constants.ts" },
    { path: "packages/ui/src/components/metric-card/metric-card.utils.ts" },
  ],
  dependencies: ["class-variance-authority"],
  registryDependencies: ["card", "cn", "skeleton"],
  aliases: {
    components: "@/components",
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [
    "fg-muted",
    "fg-primary",
    "fg-secondary",
    "radius-md",
    "status-error",
    "status-success",
  ],
  accessibility: {
    status: "audited",
    wcagLevel: "2.2-AA",
    interactive: false,
    keyboardTested: false,
    focusManaged: false,
    notes:
      "Audited. The card is named by its label via aria-labelledby. The trend's terse delta is aria-hidden and paired with a required plain-language sentence, so a coloured '+12.4%' is never the only signal (SC 1.4.1); `qpHasTrend` refuses to render a trend that has no sentence. Loading sets aria-busy and announces an overridable label while the skeletons stay aria-hidden.",
  },
  supportedPlatforms: ["web"],
  tags: ["dashboard", "data-display"],
};

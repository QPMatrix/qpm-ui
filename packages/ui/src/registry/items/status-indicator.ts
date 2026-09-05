import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Status dot paired with a mandatory textual label, optionally announced. */
export const statusIndicator: QpRegistryItem = {
  name: "status-indicator",
  type: "component",
  description: "Status dot paired with a mandatory textual label, optionally announced.",
  version: "0.1.0",
  files: [
    { path: "packages/ui/src/components/status-indicator/status-indicator.tsx" },
    { path: "packages/ui/src/components/status-indicator/status-indicator.types.ts" },
    { path: "packages/ui/src/components/status-indicator/status-indicator.constants.ts" },
    { path: "packages/ui/src/components/status-indicator/status-indicator.utils.ts" },
  ],
  dependencies: ["class-variance-authority"],
  registryDependencies: ["cn"],
  aliases: {
    components: "@/components",
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [
    "fg-secondary",
    "radius-full",
    "signal-connected",
    "signal-live",
    "signal-processing",
    "status-error",
    "status-info",
    "status-offline",
    "status-success",
    "status-warning",
  ],
  accessibility: {
    status: "audited",
    wcagLevel: "2.2-AA",
    interactive: false,
    keyboardTested: false,
    focusManaged: false,
    notes:
      "Audited. The dot is aria-hidden and the label is always present in the accessibility tree (visible, or clipped via sr-only), so the status never rests on hue alone (SC 1.4.1). The pulse is gated behind motion-safe: and hidden under motion-reduce:, and the state text is unaffected by that suppression (SC 2.3.3). The live region is opt-in.",
  },
  supportedPlatforms: ["web"],
  tags: ["status", "display"],
};

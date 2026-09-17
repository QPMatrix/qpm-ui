import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** A read-only value with a copy button and a polite live-region status. */
export const copyField: QpRegistryItem = {
  name: "copy-field",
  type: "component",
  description: "A read-only value with a copy button and a polite live-region status.",
  version: "0.1.0",
  files: [
    { path: "packages/ui/src/components/copy-field/copy-field.tsx" },
    { path: "packages/ui/src/components/copy-field/copy-field.types.ts" },
    { path: "packages/ui/src/components/copy-field/copy-field.constants.ts" },
    { path: "packages/ui/src/components/copy-field/copy-field.utils.ts" },
  ],
  dependencies: ["lucide-react"],
  registryDependencies: ["cn", "field", "input-group"],
  aliases: {
    components: "@/components",
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: ["fg-muted"],
  accessibility: {
    status: "audited",
    wcagLevel: "2.2-AA",
    interactive: true,
    keyboardTested: true,
    focusManaged: false,
    notes:
      'Audited. The copy button\'s accessible name and visible text ("Copy") never change; ' +
      'the outcome is announced through a separate role="status"/aria-live="polite" region ' +
      '("Copied" / "Copy failed"), keyboard-tested via Enter activation. On failure the ' +
      "value's text is selected for manual copy. The value is never passed to console.* on " +
      "either path — asserted directly in tests.",
  },
  supportedPlatforms: ["web"],
  tags: ["form", "clipboard"],
};

import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** A password-style input with a visibility toggle, wired into the kit's field. */
export const secretInput: QpRegistryItem = {
  name: "secret-input",
  type: "component",
  description: "A password-style input with a visibility toggle, wired into the kit's field.",
  version: "0.1.0",
  files: [
    { path: "packages/ui/src/components/secret-input/secret-input.tsx" },
    { path: "packages/ui/src/components/secret-input/secret-input.types.ts" },
    { path: "packages/ui/src/components/secret-input/secret-input.constants.ts" },
    { path: "packages/ui/src/components/secret-input/secret-input.utils.ts" },
  ],
  dependencies: ["lucide-react"],
  registryDependencies: ["cn", "field", "input-group"],
  aliases: {
    components: "@/components",
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [],
  accessibility: {
    status: "audited",
    wcagLevel: "2.2-AA",
    interactive: true,
    keyboardTested: true,
    focusManaged: false,
    notes:
      'Audited. type="password" by default; the toggle flips it to "text", updates ' +
      "aria-pressed, and keeps focus on itself across the flip (plain state update, no " +
      "remount) — keyboard-tested via Enter activation. The toggle's accessible name folds " +
      "in the field's own label so two secret inputs on one page are distinguishable. " +
      'autoComplete="off" and spellCheck={false} are fixed, not overridable. The value is ' +
      "asserted, in tests, to never appear in any data-*, title or aria-* attribute.",
  },
  supportedPlatforms: ["web"],
  tags: ["form", "security"],
};

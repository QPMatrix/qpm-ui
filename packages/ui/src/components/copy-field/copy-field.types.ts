import type { ReactNode } from "react";

/**
 * QPCopyField — public type surface.
 */

/** Copy attempt outcomes this component announces through its live region. */
export type QPCopyFieldStatus = "idle" | "copied" | "failed";

/**
 * The clipboard operation this component needs, narrowed to one method so a
 * test (or an environment with no `navigator.clipboard`) can inject a
 * substitute. Defaults to `navigator.clipboard` when available.
 */
export interface QPCopyFieldClipboard {
  writeText: (text: string) => Promise<void>;
}

export interface QPCopyFieldProps {
  /** Accessible name for the field, rendered as a real `<label>` (WCAG 2.2 SC 3.3.2). */
  label: string;
  /** The read-only value shown, and what gets copied. Never logged. */
  value: string;
  /** Render as a multi-line, read-only textarea instead of a single-line input. */
  multiline?: boolean;
  /** The copy button's accessible name AND visible text. Stays unchanged after a copy attempt. */
  copyLabel?: string;
  /** The live-region text after a successful copy. Overridable for localisation. */
  copiedLabel?: string;
  /** The live-region text after a failed copy attempt. Overridable for localisation. */
  failedLabel?: string;
  /**
   * The copy button's icon. Passed as an element, never a string key.
   * Defaults to a clipboard glyph.
   */
  copyIcon?: ReactNode;
  /** Persistent helper text, wired to the field by id. */
  hint?: ReactNode;
  /** Called with `value` after a successful copy. Never called on failure. */
  onCopy?: (value: string) => void;
  /**
   * Injectable clipboard, for a test environment or a browser with no
   * `navigator.clipboard`. Defaults to `navigator.clipboard` when present.
   */
  clipboard?: QPCopyFieldClipboard;
  /** Extra classes on the field wrapper, merged through `cn()` last. */
  className?: string;
  /** Extra classes on the value element itself, merged through `cn()` last. */
  fieldClassName?: string;
}

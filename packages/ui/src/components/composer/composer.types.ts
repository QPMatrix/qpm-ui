import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";

import type { qpComposerVariants } from "./composer.constants";

/**
 * QPComposer — public type surface.
 */
export interface QPComposerProps
  extends
    Omit<ComponentProps<"form">, "onSubmit" | "children">,
    VariantProps<typeof qpComposerVariants> {
  /**
   * Accessible name for the text field. Required: a bare textarea with only a
   * placeholder is a WCAG 2.2 SC 3.3.2 (Labels or Instructions) failure, and
   * placeholders vanish the moment the user types.
   */
  label: string;
  /** Render `label` visibly above the field instead of only exposing it to AT. */
  labelVisible?: boolean;
  /** Controlled text. Pair with `onValueChange`. */
  value?: string;
  /** Initial text for the uncontrolled case. Ignored when `value` is passed. */
  defaultValue?: string;
  /** Called on every keystroke with the raw (untrimmed) field text. */
  onValueChange?: (value: string) => void;
  /**
   * Called with the trimmed text when the form is submitted, and only when
   * that text is non-empty and the composer is neither disabled nor busy.
   */
  onSubmit?: (value: string) => void;
  /** Field placeholder. Supplementary to `label`, never a replacement for it. */
  placeholder?: string;
  /** Accessible name of the submit control. Required — it may be icon-only. */
  submitLabel: string;
  /** Submit button content. Defaults to `submitLabel` rendered as text. */
  submitContent?: ReactNode;
  /** Elements rendered before the submit control — attachment triggers, etc. */
  toolbar?: ReactNode;
  /** Persistent helper text, rendered under the field and wired to the input. */
  hint?: ReactNode;
  /**
   * Validation message. Its presence puts the field in the invalid state and
   * makes it the field's description, replacing `hint`.
   */
  error?: ReactNode;
  /** Disable the whole composer. */
  disabled?: boolean;
  /** A send is in flight: the field stays readable, submitting is blocked. */
  busy?: boolean;
  /** Hard character cap forwarded to the field. */
  maxLength?: number;
  /**
   * Submit when Enter is pressed without a modifier (Shift/Alt inserts a
   * newline). Set false for surfaces where Enter must always insert a newline.
   */
  submitOnEnter?: boolean;
  /** Number of visible text rows before the field grows. */
  rows?: number;
  /** Extra classes for the textarea, merged through `cn()` last. */
  fieldClassName?: string;
}

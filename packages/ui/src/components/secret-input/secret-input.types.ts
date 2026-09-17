import type { ComponentProps, ReactNode } from "react";

/**
 * QPSecretInput — public type surface.
 */

/** The props `ui/input-group`'s `InputGroupInput` accepts, minus what this component owns. */
export type QPSecretInputFieldProps = Omit<
  ComponentProps<"input">,
  "type" | "id" | "value" | "defaultValue" | "onChange" | "className"
>;

export interface QPSecretInputProps extends QPSecretInputFieldProps {
  /**
   * Accessible name for the field, rendered as a real `<label>` — never a
   * placeholder (WCAG 2.2 SC 3.3.2). Also folded into the toggle button's own
   * accessible name (`"Show " + label` / `"Hide " + label"`), so two secret
   * inputs on the same page announce distinct toggle controls.
   */
  label: string;
  /** Controlled value. Pair with `onValueChange`. */
  value?: string;
  /** Initial value for the uncontrolled case. Ignored when `value` is passed. */
  defaultValue?: string;
  /** Called on every keystroke with the raw field text. */
  onValueChange?: (value: string) => void;
  /**
   * The toggle's accessible name (and visible text, if `toggleTextVisible`)
   * while the value is hidden — the action it performs when pressed.
   * Overridable for localisation.
   */
  showLabel?: string;
  /** The toggle's accessible name while the value is visible. Overridable for localisation. */
  hideLabel?: string;
  /**
   * The toggle's icon while the value is hidden. Passed as an element, never
   * a string key. Defaults to an open-eye glyph.
   */
  showIcon?: ReactNode;
  /**
   * The toggle's icon while the value is visible. Passed as an element, never
   * a string key. Defaults to a crossed-out-eye glyph.
   */
  hideIcon?: ReactNode;
  /** Persistent helper text, wired to the field by id. */
  hint?: ReactNode;
  /**
   * Validation message. Its presence puts the field in the invalid state and
   * makes it the field's description, replacing `hint`.
   */
  error?: ReactNode;
  /** Extra classes on the field wrapper, merged through `cn()` last. */
  className?: string;
  /** Extra classes on the input itself, merged through `cn()` last. */
  fieldClassName?: string;
}

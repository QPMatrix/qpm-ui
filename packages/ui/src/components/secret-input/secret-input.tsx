"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

import { cn, isRenderable } from "../../lib/utils";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../ui/input-group";
import {
  QP_SECRET_INPUT_AUTOCOMPLETE_OFF,
  QP_SECRET_INPUT_DEFAULT_HIDE_LABEL,
  QP_SECRET_INPUT_DEFAULT_SHOW_LABEL,
} from "./secret-input.constants";
import type { QPSecretInputProps } from "./secret-input.types";
import {
  qpResolveSecretInputDescribedBy,
  qpSecretInputToggleLabel,
  qpSecretInputType,
} from "./secret-input.utils";

/**
 * QPSecretInput — a password-style input with a visibility toggle, wired
 * into the kit's `field` (`../ui/field`) for label/description/error.
 *
 * Composes `../ui/input-group` for the field + toggle layout and
 * `../ui/field` for the label/description/error wiring — it never hand-rolls
 * either. `type="password"` by default; the toggle flips it to `"text"` and
 * back, and focus stays on the toggle across the flip (a plain state update,
 * no remount). The value never lands in a `data-*`, `title` or `aria-*`
 * attribute — only ever in the input's own `value`.
 *
 * `autoComplete="off"` and `spellCheck={false}` are fixed, not props: they
 * are applied after `...props` on purpose, so a consumer cannot accidentally
 * weaken a secret field's browser-level protections.
 */
export function QPSecretInput({
  label,
  value,
  defaultValue = "",
  onValueChange,
  showLabel = QP_SECRET_INPUT_DEFAULT_SHOW_LABEL,
  hideLabel = QP_SECRET_INPUT_DEFAULT_HIDE_LABEL,
  showIcon,
  hideIcon,
  hint,
  error,
  disabled,
  className,
  fieldClassName,
  ...props
}: QPSecretInputProps) {
  const generatedId = useId();
  const fieldId = `${generatedId}-field`;
  const hintId = `${generatedId}-hint`;
  const errorId = `${generatedId}-error`;

  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const text = isControlled ? value : internalValue;

  const [visible, setVisible] = useState(false);

  const invalid = isRenderable(error);
  const toggleLabel = qpSecretInputToggleLabel(visible, showLabel, hideLabel, label);

  return (
    <Field data-slot="secret-input" className={cn(className)}>
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
      <InputGroup data-slot="secret-input-group">
        <InputGroupInput
          id={fieldId}
          data-slot="secret-input-field"
          type={qpSecretInputType(visible)}
          value={text}
          disabled={disabled}
          aria-invalid={invalid}
          aria-describedby={qpResolveSecretInputDescribedBy(error, hint, errorId, hintId)}
          onChange={(event) => {
            const next = event.target.value;
            if (!isControlled) {
              setInternalValue(next);
            }
            onValueChange?.(next);
          }}
          className={fieldClassName}
          {...props}
          autoComplete={QP_SECRET_INPUT_AUTOCOMPLETE_OFF}
          spellCheck={false}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            data-slot="secret-input-toggle"
            aria-pressed={visible}
            aria-label={toggleLabel}
            disabled={disabled}
            onClick={() => {
              setVisible((current) => !current);
            }}
          >
            {visible ? (
              isRenderable(hideIcon) ? (
                hideIcon
              ) : (
                <EyeOff className="size-4" />
              )
            ) : isRenderable(showIcon) ? (
              showIcon
            ) : (
              <Eye className="size-4" />
            )}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {invalid ? (
        <FieldError id={errorId}>{error}</FieldError>
      ) : isRenderable(hint) ? (
        <FieldDescription id={hintId}>{hint}</FieldDescription>
      ) : null}
    </Field>
  );
}

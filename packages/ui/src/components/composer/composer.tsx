"use client";

import { useCallback, useId, useState, type KeyboardEvent } from "react";

import { cn, isRenderable } from "../../lib/utils";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  QP_COMPOSER_DEFAULT_ROWS,
  QP_COMPOSER_FIELD_RESET_CLASSES,
  qpComposerVariants,
} from "./composer.constants";
import type { QPComposerProps } from "./composer.types";
import { qpCanSubmitComposer, qpResolveDescribedBy, qpShouldSubmitOnKey } from "./composer.utils";

/**
 * QPComposer — the message input at the foot of a chat surface.
 *
 * Composes `../ui/textarea` and `../ui/button`; it never hand-rolls either.
 * The whole component is prop-driven: no placeholder, button caption, hint or
 * error string is baked in, and the submit affordance is a real `<button
 * type="submit">` inside a real `<form>`, so browser and assistive-technology
 * submit paths (Enter in the field, implicit form submission, voice control)
 * all work without extra wiring.
 *
 * Controlled or uncontrolled: pass `value` + `onValueChange` for the former,
 * `defaultValue` for the latter. `onSubmit` receives the trimmed text.
 */
export function QPComposer({
  label,
  labelVisible = false,
  value,
  defaultValue = "",
  onValueChange,
  onSubmit,
  placeholder,
  submitLabel,
  submitContent,
  toolbar,
  hint,
  error,
  disabled = false,
  busy = false,
  maxLength,
  submitOnEnter = true,
  rows = QP_COMPOSER_DEFAULT_ROWS,
  size,
  className,
  fieldClassName,
  ...props
}: QPComposerProps) {
  const generatedId = useId();
  const fieldId = `${generatedId}-field`;
  const hintId = `${generatedId}-hint`;
  const errorId = `${generatedId}-error`;

  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const text = isControlled ? value : internalValue;

  const invalid = isRenderable(error);
  const canSubmit = qpCanSubmitComposer(text, disabled, busy);

  const setText = useCallback(
    (next: string) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const submit = useCallback(() => {
    if (!qpCanSubmitComposer(text, disabled, busy)) {
      return;
    }
    onSubmit?.(text.trim());
    if (!isControlled) {
      setInternalValue("");
    }
  }, [text, disabled, busy, onSubmit, isControlled]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (!qpShouldSubmitOnKey(event, submitOnEnter)) {
        return;
      }
      event.preventDefault();
      submit();
    },
    [submitOnEnter, submit],
  );

  return (
    <form
      data-slot="composer"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className={cn(qpComposerVariants({ size }), className)}
      {...props}
    >
      <label
        htmlFor={fieldId}
        data-slot="composer-label"
        className={labelVisible ? "px-1 text-xs font-medium text-fg-secondary" : "sr-only"}
      >
        {label}
      </label>

      <Textarea
        id={fieldId}
        data-slot="composer-field"
        rows={rows}
        value={text}
        disabled={disabled}
        readOnly={busy}
        aria-invalid={invalid}
        aria-describedby={qpResolveDescribedBy(error, hint, errorId, hintId)}
        {...(maxLength === undefined ? {} : { maxLength })}
        {...(placeholder === undefined ? {} : { placeholder })}
        onChange={(event) => {
          setText(event.target.value);
        }}
        onKeyDown={handleKeyDown}
        className={cn(QP_COMPOSER_FIELD_RESET_CLASSES, fieldClassName)}
      />

      <div data-slot="composer-actions" className="flex items-center justify-between gap-2">
        <div data-slot="composer-toolbar" className="flex min-w-0 items-center gap-1">
          {toolbar}
        </div>
        <Button
          type="submit"
          data-slot="composer-submit"
          size={size === "sm" ? "sm" : "default"}
          aria-label={submitLabel}
          disabled={!canSubmit}
        >
          {isRenderable(submitContent) ? submitContent : submitLabel}
        </Button>
      </div>

      {invalid ? (
        <p
          id={errorId}
          data-slot="composer-error"
          role="alert"
          className="px-1 text-xs text-status-error"
        >
          {error}
        </p>
      ) : isRenderable(hint) ? (
        <p id={hintId} data-slot="composer-hint" className="px-1 text-xs text-fg-muted">
          {hint}
        </p>
      ) : null}
    </form>
  );
}

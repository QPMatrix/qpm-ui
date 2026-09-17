"use client";

import { Copy } from "lucide-react";
import { useId, useRef, useState } from "react";

import { cn, isRenderable } from "../../lib/utils";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from "../ui/input-group";
import {
  QP_COPY_FIELD_DEFAULT_COPIED_LABEL,
  QP_COPY_FIELD_DEFAULT_COPY_LABEL,
  QP_COPY_FIELD_DEFAULT_FAILED_LABEL,
} from "./copy-field.constants";
import type { QPCopyFieldClipboard, QPCopyFieldProps, QPCopyFieldStatus } from "./copy-field.types";
import { qpCopyFieldStatusMessage } from "./copy-field.utils";

/** `navigator.clipboard` when the runtime and context actually expose it. */
function qpDefaultClipboard(): QPCopyFieldClipboard | undefined {
  if (typeof navigator === "undefined" || !("clipboard" in navigator)) {
    return undefined;
  }
  return navigator.clipboard;
}

/**
 * QPCopyField — a read-only value with a copy button and a polite live
 * region reporting the outcome.
 *
 * Composes `../ui/input-group` (single or multi-line via `multiline`) and
 * `../ui/field` for the label/description wiring, never hand-rolling either.
 * The copy button's accessible name and visible text stay `copyLabel`
 * ("Copy") in every state — the outcome is announced separately, through the
 * live region, so a screen reader hears "Copied" without the button's own
 * name changing out from under a user who has already located it.
 *
 * On a clipboard failure the value's text is selected so the user can copy it
 * manually with their own keyboard shortcut. The value is never logged —
 * there is no `console` call anywhere in this component, on either path.
 */
export function QPCopyField({
  label,
  value,
  multiline = false,
  copyLabel = QP_COPY_FIELD_DEFAULT_COPY_LABEL,
  copiedLabel = QP_COPY_FIELD_DEFAULT_COPIED_LABEL,
  failedLabel = QP_COPY_FIELD_DEFAULT_FAILED_LABEL,
  copyIcon,
  hint,
  onCopy,
  clipboard,
  className,
  fieldClassName,
}: QPCopyFieldProps) {
  const generatedId = useId();
  const fieldId = `${generatedId}-field`;
  const hintId = `${generatedId}-hint`;
  const elementRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const setElementRef = (node: HTMLInputElement | HTMLTextAreaElement | null) => {
    elementRef.current = node;
  };
  const [status, setStatus] = useState<QPCopyFieldStatus>("idle");

  const handleCopy = async () => {
    const activeClipboard = clipboard ?? qpDefaultClipboard();
    if (activeClipboard === undefined) {
      setStatus("failed");
      elementRef.current?.select();
      return;
    }
    try {
      await activeClipboard.writeText(value);
      setStatus("copied");
      onCopy?.(value);
    } catch {
      setStatus("failed");
      elementRef.current?.select();
    }
  };

  return (
    <Field data-slot="copy-field" className={cn(className)}>
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
      <InputGroup data-slot="copy-field-group">
        {multiline ? (
          <InputGroupTextarea
            id={fieldId}
            data-slot="copy-field-value"
            ref={setElementRef}
            readOnly
            rows={4}
            value={value}
            className={fieldClassName}
          />
        ) : (
          <InputGroupInput
            id={fieldId}
            data-slot="copy-field-value"
            ref={setElementRef}
            readOnly
            value={value}
            className={fieldClassName}
          />
        )}
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            data-slot="copy-field-button"
            onClick={() => {
              void handleCopy();
            }}
          >
            {isRenderable(copyIcon) ? copyIcon : <Copy className="size-4" />}
            <span>{copyLabel}</span>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <div
        role="status"
        aria-live="polite"
        data-slot="copy-field-status"
        className="text-body-sm text-fg-muted empty:hidden"
      >
        {qpCopyFieldStatusMessage(status, copiedLabel, failedLabel)}
      </div>
      {isRenderable(hint) ? <FieldDescription id={hintId}>{hint}</FieldDescription> : null}
    </Field>
  );
}

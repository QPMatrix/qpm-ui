import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { qpIconButtonVariants } from "./icon-button.constants";
import type { QPIconButtonProps } from "./icon-button.types";
import { qpIconButtonPrimitiveSize, qpResolveIconButtonSize } from "./icon-button.utils";

/**
 * QPIconButton — a square, icon-only button.
 *
 * This is a *composition* of `../ui/button`, never a hand-rolled `<button>`:
 * every behaviour that makes the primitive correct (Base UI's
 * focusable-when-disabled handling, the `focus-visible` ring, variant tokens,
 * `render` / `nativeButton` composition, ref forwarding) is inherited rather
 * than re-implemented, and every prop the primitive accepts passes through.
 *
 * Composition: to render as something other than a `<button>` (a link, say),
 * pass the primitive's `render` prop and, when the swapped-in element is not a
 * native button, `nativeButton={false}` — both flow through untouched:
 *
 * ```tsx
 * <QPIconButton label="Docs" render={<a href="/docs" />} nativeButton={false}>
 *   <BookIcon />
 * </QPIconButton>
 * ```
 */
export function QPIconButton({ label, size, className, ...props }: QPIconButtonProps) {
  const resolvedSize = qpResolveIconButtonSize(size);

  return (
    <Button
      data-slot="icon-button"
      size={qpIconButtonPrimitiveSize(resolvedSize)}
      {...props}
      // `aria-label` is applied AFTER the spread on purpose: `label` is the
      // documented, required way to name this control, so it must not be
      // silently dropped by a stray `aria-label` in the rest props.
      aria-label={label}
      className={cn(qpIconButtonVariants({ size: resolvedSize }), className)}
    />
  );
}

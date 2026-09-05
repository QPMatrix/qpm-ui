import { cva } from "class-variance-authority";

/**
 * QPComposer — class maps and fixed values.
 */

export const qpComposerVariants = cva(
  "flex w-full flex-col gap-2 rounded-xl border border-border-default bg-surface-primary p-2 focus-within:border-border-focus",
  {
    variants: {
      size: {
        default: "text-sm",
        sm: "gap-1.5 p-1.5 text-xs",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

/**
 * The field sits inside the composer's own bordered shell, so the textarea
 * primitive's border and focus ring are stripped — two nested rings on one
 * control reads as a rendering bug. The shell's `focus-within:` border is what
 * replaces it, which is why removing these is not an unmarked focus removal.
 */
export const QP_COMPOSER_FIELD_RESET_CLASSES =
  "min-h-0 resize-none border-0 bg-transparent px-1 py-1 focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent";

/** Applied when the caller passes no `rows`. */
export const QP_COMPOSER_DEFAULT_ROWS = 2;

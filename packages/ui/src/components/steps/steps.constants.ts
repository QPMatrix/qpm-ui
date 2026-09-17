import { cva } from "class-variance-authority";

/**
 * QPSteps — class maps and fixed values.
 */

export const qpStepsListVariants = cva("flex list-none", {
  variants: {
    orientation: {
      horizontal: "flex-row flex-wrap items-start gap-4",
      vertical: "flex-col gap-4",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

export const qpStepsItemVariants = cva("flex min-w-0 flex-1 items-start gap-2", {
  variants: {
    orientation: {
      horizontal: "flex-col",
      vertical: "flex-row",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

/**
 * The indicator (number or check). Colour is a redundant cue only — the
 * glyph itself (digit vs. check icon) and the sr-only state text are what
 * actually carry the state (WCAG 2.2 SC 1.4.1).
 */
export const qpStepsIndicatorVariants = cva(
  "flex size-7 shrink-0 items-center justify-center rounded-full text-label-sm font-medium transition-colors motion-reduce:transition-none",
  {
    variants: {
      state: {
        completed: "bg-brand-primary text-brand-foreground",
        current: "bg-surface-primary text-fg-primary ring-2 ring-brand-primary",
        upcoming: "bg-surface-secondary text-fg-muted",
      } satisfies Record<string, string>,
    },
    defaultVariants: {
      state: "upcoming",
    },
  },
);

/** Applied when the caller passes no `orientation`. */
export const QP_STEPS_DEFAULT_ORIENTATION = "horizontal";

/** Applied when the caller passes no `completedStateLabel`. */
export const QP_STEPS_DEFAULT_COMPLETED_LABEL = "Completed";

/** Applied when the caller passes no `currentStateLabel`. */
export const QP_STEPS_DEFAULT_CURRENT_LABEL = "Current step";

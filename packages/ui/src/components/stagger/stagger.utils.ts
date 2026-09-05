import { QP_STAGGER_DEFAULT_AMOUNT } from "./stagger.constants";

/**
 * QPStagger — pure helpers.
 */

/**
 * The play trigger, as a spreadable prop object.
 *
 * `whileInView` and `animate` are MUTUALLY EXCLUSIVE on a Motion element:
 * passing both makes the group play immediately AND again on scroll, which
 * double-fires every child. Returning one or the other from a single function
 * is what makes that impossible to get wrong at a call site.
 */
export function qpStaggerTrigger(options: {
  whenVisible: boolean;
  amount?: number | undefined;
}): Record<string, unknown> {
  return options.whenVisible
    ? {
        whileInView: "visible",
        viewport: { once: true, amount: options.amount ?? QP_STAGGER_DEFAULT_AMOUNT },
      }
    : { animate: "visible" };
}

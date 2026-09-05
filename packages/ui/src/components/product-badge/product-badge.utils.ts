import type { ReactNode } from "react";

import { isRenderable } from "../../lib/utils";
import { QP_PRODUCT_BADGE_NAMES } from "./product-badge.constants";
import type { QPProductBadgeProduct } from "./product-badge.types";

/**
 * QPProductBadge — pure helpers.
 */

/**
 * The text the chip renders: the caller's `children` when supplied, otherwise
 * the brand proper noun for `product`.
 *
 * `isRenderable` rather than `children ?? default` because `children` can be
 * `false` (from `flag && <Thing/>`), which is neither null nor undefined and
 * would otherwise render an unnamed, colour-only chip — exactly the WCAG 2.2
 * SC 1.4.1 failure the component exists to prevent.
 */
export function qpResolveProductBadgeName(
  product: QPProductBadgeProduct,
  children: ReactNode,
): ReactNode {
  return isRenderable(children) ? children : QP_PRODUCT_BADGE_NAMES[product];
}

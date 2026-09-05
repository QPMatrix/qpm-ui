import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";
import { qpProductBadgeVariants } from "./product-badge.constants";
import type { QPProductBadgeProps } from "./product-badge.types";
import { qpResolveProductBadgeName } from "./product-badge.utils";

/**
 * QPProductBadge — a brand chip naming a QPMatrix product surface.
 *
 * Built on `../ui/badge`, so `render` composition, ref forwarding and the
 * badge chrome all come from the primitive. The tone is a `cva` variant bound
 * to QPMatrix token roles only.
 *
 * The product NAME is always rendered as text; the tone is a redundant cue and
 * never the carrier of meaning (WCAG 2.2 SC 1.4.1, Use of Colour).
 */
export function QPProductBadge({ product, children, className, ...props }: QPProductBadgeProps) {
  return (
    <Badge
      data-slot="product-badge"
      data-product={product}
      variant="secondary"
      {...props}
      className={cn(qpProductBadgeVariants({ product }), className)}
    >
      {qpResolveProductBadgeName(product, children)}
    </Badge>
  );
}

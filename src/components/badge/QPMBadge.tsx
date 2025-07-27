import type { ComponentProps, FC, ReactNode } from "react";
import type { QPMBadgeVariant } from "./types/variant";
import type { QPMBadgeSize } from "./types/size";
import clsx from "clsx";
import styles from "./styles.module.css";

export type QPMBadgeProps = {
  children: ReactNode;
  variant?: QPMBadgeVariant;
  size?: QPMBadgeSize;
} & ComponentProps<"span">;

export const QPMBadge: FC<QPMBadgeProps> = ({
  children,
  variant = "info",
  size = "md",
  className,
  ...props
}) => {
  return (
    <span
      className={clsx(
        styles.badge,
        styles[variant],
        styles[size],
        className // Allow custom class overrides
      )}
      {...props}
    >
      {children}
    </span>
  );
};

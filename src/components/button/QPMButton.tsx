import { ButtonHTMLAttributes, FC, ReactNode } from "react";
import type { QPMButtonSize, QPMButtonVariant } from "./types";
import clsx from "clsx";
import styles from "./styles.module.css";
export interface QPMButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: QPMButtonVariant;
  size?: QPMButtonSize;
  children: ReactNode;
}

export const QPMButton: FC<QPMButtonProps> = ({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}) => {
  return (
    <button
      className={clsx(
        "QPMButton",
        styles.button,
        styles[variant],
        styles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

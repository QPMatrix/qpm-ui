import type { ComponentProps, FC } from "react";
import styles from "./styles.module.css";
import clsx from "clsx";

export type QPMInputProps = {
  label?: string;
  errorMessage?: string;
  labelClassName?: string;
} & ComponentProps<"input">;

export const QPMInput: FC<QPMInputProps> = ({
  label,
  errorMessage,
  labelClassName,
  className,
  ...props
}) => {
  return (
    <div className={clsx(styles.container)}>
      {label && (
        <label className={clsx(styles.labelStyle, labelClassName)}>
          {label}
        </label>
      )}
      <input
        className={clsx(
          styles.input,
          errorMessage ? styles.errorBorder : styles.successBorder,
          className
        )}
        onFocus={(e) => {
          e.currentTarget.classList.add(clsx(styles.focus));
        }}
        onBlur={(e) => {
          e.currentTarget.classList.remove(clsx(styles.focus));
          errorMessage ? clsx(styles.errorBlur) : styles.blur;
          e.currentTarget.classList.add();
        }}
        {...props}
      />
      {errorMessage && (
        <span className={styles.errorMessage}>{errorMessage}</span>
      )}
    </div>
  );
};

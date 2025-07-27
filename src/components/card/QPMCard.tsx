import clsx from "clsx";
import { ComponentProps, FC } from "react";
import styles from "./styles.module.css";
//TODO handle the card in better way
const QPMCard: FC<ComponentProps<"article">> = ({ className, ...props }) => {
  return (
    <article
      data-slot="card"
      className={clsx("QPMCard", styles.card, className)}
      {...props}
    />
  );
};

const QPMCardHeader: FC<ComponentProps<"div">> = ({ className, ...props }) => {
  return (
    <div
      data-slot="card-header"
      className={clsx("QPMCardHeader", className)}
      {...props}
    />
  );
};

const QPMCardTitle: FC<ComponentProps<"div">> = ({ className, ...props }) => {
  return (
    <div
      data-slot="card-header"
      className={clsx("QPMCardTitle", className)}
      {...props}
    />
  );
};

const QPMCardDescription: FC<ComponentProps<"div">> = ({
  className,
  ...props
}) => {
  return (
    <div
      data-slot="card-description"
      className={clsx("QPMCardDescription", className)}
      {...props}
    />
  );
};
const QPMCardAction: FC<ComponentProps<"div">> = ({ className, ...props }) => {
  return (
    <div
      data-slot="card-action"
      className={clsx("QPMCardAction", className)}
      {...props}
    />
  );
};

const QPMCardContent: FC<ComponentProps<"div">> = ({ className, ...props }) => {
  return (
    <div
      data-slot="card-content"
      className={clsx("QPMCardContent", className)}
      {...props}
    />
  );
};

const QPMCardFooter: FC<ComponentProps<"div">> = ({ className, ...props }) => {
  return (
    <div
      data-slot="card-footer"
      className={clsx("QPMCardFooter", className)}
      {...props}
    />
  );
};

export {
  QPMCard,
  QPMCardAction,
  QPMCardContent,
  QPMCardDescription,
  QPMCardFooter,
  QPMCardHeader,
  QPMCardTitle,
};

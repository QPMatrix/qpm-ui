import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";

import type { qpPageContainerVariants } from "./page-container.constants";

/**
 * QPPageContainer — public type surface.
 */

/**
 * Reading width.
 *
 * `prose` is capped near 68 characters because line length, not screen width,
 * is what makes long text readable — a paragraph spanning a 27" monitor loses
 * the reader on every line return.
 */
export type QPPageWidth = "prose" | "content" | "wide" | "full";

/** Vertical rhythm around the page's content. */
export type QPPagePadding = "none" | "compact" | "default" | "spacious";

export interface QPPageContainerProps
  extends
    Omit<ComponentProps<"div">, "children" | "className">,
    VariantProps<typeof qpPageContainerVariants> {
  /** Maximum reading width. Defaults to `content`. */
  width?: QPPageWidth;
  /** Block padding. Defaults to `default`. */
  padding?: QPPagePadding;
  /**
   * Render as the page's `<main>` landmark.
   *
   * Exactly ONE element per page may be `main`. It is what a screen-reader
   * user's "skip to content" lands on, so a page with none forces them through
   * the whole navigation on every visit, and a page with two makes the
   * shortcut ambiguous.
   */
  as?: "div" | "main" | "section" | "article";
  /**
   * Animate the container's content in on mount.
   *
   * Off by default: a container is often nested inside a `QPPageTransition`
   * that is already animating, and two entrances on the same content read as
   * a stutter.
   */
  animate?: boolean;
  /** Content. */
  children?: ReactNode;
  className?: string | undefined;
}

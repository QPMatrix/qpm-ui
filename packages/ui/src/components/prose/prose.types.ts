import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ComponentType, ReactNode } from "react";

import type { qpProseVariants } from "./prose.constants";

/**
 * QPProse — public type surface.
 */

/** Reading width for long-form text. */
export type QPProseWidth = "measure" | "full";

/** Type scale for the whole document. */
export type QPProseSize = "sm" | "default" | "lg";

export interface QPProseProps
  extends
    Omit<ComponentProps<"div">, "children" | "className">,
    VariantProps<typeof qpProseVariants> {
  /**
   * Reading width. Defaults to `measure` (~68 characters), because line
   * length rather than screen width is what makes long text readable.
   */
  width?: QPProseWidth;
  /** Type scale. Defaults to `default`. */
  size?: QPProseSize;
  /**
   * Rendered Markdown/MDX, or ordinary JSX.
   *
   * This component styles whatever HTML it is given — it does NOT parse
   * Markdown. Compilation belongs to the app's bundler (`@next/mdx`,
   * `@mdx-js/rollup`, a remark pipeline), which is where the plugin set,
   * syntax highlighting and content source already live. A UI kit that
   * shipped its own parser would fight all three.
   */
  children?: ReactNode;
  className?: string | undefined;
}

/**
 * The component map handed to an MDX provider.
 *
 * MDX renders `# Heading` as a plain `<h1>` unless you tell it otherwise.
 * Passing this map makes it render `QPHeading` instead, so authored content
 * inherits the same type ramp, outline discipline and token colours as
 * hand-written JSX — rather than being a second, near-miss design system that
 * only appears on documentation pages.
 *
 * ```tsx
 * import { MDXProvider } from "@mdx-js/react";
 * import { QPProse, qpMdxComponents } from "@qpmatrix/ui";
 *
 * <MDXProvider components={qpMdxComponents}>
 *   <QPProse><Content /></QPProse>
 * </MDXProvider>
 * ```
 */
export type QPMdxComponents = Record<string, ComponentType<Record<string, unknown>>>;

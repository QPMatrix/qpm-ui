import { cn } from "../../lib/utils";
import { qpProseVariants } from "./prose.constants";
import type { QPProseProps } from "./prose.types";
import { qpBuildMdxComponents } from "./prose.utils";

/**
 * QPProse — the surface authored content is rendered on.
 *
 * Markdown and MDX produce plain HTML: `<h2>`, `<p>`, `<ul>`, `<pre>`. There
 * is no call site to hang a class on, so this is the one component in the kit
 * that styles by descendant selector — every rule scoped under it, every value
 * a token role, so a documentation page inherits the same type ramp, link
 * treatment and code styling as hand-written JSX.
 *
 * It does NOT parse Markdown. Compilation belongs to the app's bundler
 * (`@next/mdx`, `@mdx-js/rollup`, a remark pipeline), which is where the
 * plugin set, syntax highlighting and content source already live; a UI kit
 * shipping its own parser would fight all three and pin their versions.
 *
 * Pair it with `qpMdxComponents` so MDX headings become `QPHeading` and keep
 * their outline discipline:
 *
 * ```tsx
 * import { MDXProvider } from "@mdx-js/react";
 *
 * <MDXProvider components={qpMdxComponents}>
 *   <QPProse width="measure"><Article /></QPProse>
 * </MDXProvider>
 * ```
 *
 * For plain rendered-HTML strings, set the HTML on a child yourself — this
 * component deliberately exposes no `dangerouslySetInnerHTML` shortcut, so
 * injecting unsanitised HTML is never the path of least resistance.
 */
export function QPProse({ width, size, className, children, ...props }: QPProseProps) {
  return (
    <div data-slot="prose" className={cn(qpProseVariants({ width, size }), className)} {...props}>
      {children}
    </div>
  );
}

/**
 * The MDX component map, built once.
 *
 * A stable identity matters: `MDXProvider` re-renders its whole subtree when
 * the map changes, so building it inline at a call site would re-render every
 * document on every parent render.
 */
export const qpMdxComponents = qpBuildMdxComponents();

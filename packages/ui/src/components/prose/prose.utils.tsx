import type { ComponentType } from "react";

import { QPHeading } from "../heading";
import { QPText } from "../text";
import type { QPMdxComponents } from "./prose.types";

/**
 * QPProse — pure helpers.
 */

/**
 * The component map to hand an MDX provider.
 *
 * Without it, MDX renders `## Heading` as a bare `<h2>` and a paragraph as a
 * bare `<p>`. `QPProse`'s descendant styles would still catch those — but the
 * heading would carry no outline discipline and no `QPHeading` behaviour, and
 * authored content would quietly become a second, near-miss design system that
 * only appears on documentation pages.
 *
 * Mapping `h1`–`h4` to `QPHeading` with a FIXED level (rather than letting the
 * variant pick one) is the important part: in MDX the `#` count IS the outline
 * level the author intended, so it must be passed through verbatim.
 *
 * Everything not listed here — lists, tables, code, links — is deliberately
 * left as plain HTML and styled by `QPProse`'s descendant selectors. Wrapping
 * every element in a React component would double the tree size of a long
 * document for no benefit.
 */
export function qpBuildMdxComponents(): QPMdxComponents {
  const heading = (level: 1 | 2 | 3 | 4) => (props: Record<string, unknown>) => (
    <QPHeading level={level} {...props} />
  );

  return {
    h1: heading(1),
    h2: heading(2),
    h3: heading(3),
    h4: heading(4),
    p: (props: Record<string, unknown>) => <QPText variant="body" tone="secondary" {...props} />,
  };
}

/**
 * Is this element one MDX will override via the component map?
 *
 * Exported so a consumer building their OWN map can check they are not
 * shadowing something the kit already handles — and so the mapping can be
 * asserted in a test rather than being a comment that drifts.
 */
export function qpIsMappedMdxElement(tag: string): boolean {
  return ["h1", "h2", "h3", "h4", "p"].includes(tag);
}

/** Type-only re-export so consumers can annotate their own maps. */
export type { ComponentType };

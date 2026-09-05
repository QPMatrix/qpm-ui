import { z } from "zod";

import { qpRegistryItemSchema, SEMVER_PATTERN } from "./registry-item.schema";

/**
 * The QPMatrix canonical registry: metadata plus every item @qpmatrix/ui
 * distributes. The shadcn manifests in `registry.json` are generated *from*
 * this; nothing reads them back.
 */

/**
 * Envelope-only view: item shape is deliberately left `unknown` so the
 * validator can attribute a bad item to the `schema` rule with its own name,
 * instead of drowning in one giant root-level parse failure.
 */
export const qpRegistryEnvelopeSchema = z.strictObject({
  name: z.string().min(1, { error: "Registry `name` must not be empty." }),
  homepage: z.url({ error: "Registry `homepage` must be an absolute URL." }),
  version: z.string().regex(SEMVER_PATTERN, {
    error: "Registry `version` must be an exact `major.minor.patch` semver string.",
  }),
  items: z.array(z.unknown()),
});

export type QpRegistryEnvelope = z.infer<typeof qpRegistryEnvelopeSchema>;

export const qpRegistrySchema = qpRegistryEnvelopeSchema
  .extend({ items: z.array(qpRegistryItemSchema) })
  .superRefine((registry, ctx) => {
    const firstIndexByName = new Map<string, number>();

    registry.items.forEach((item, index) => {
      const firstIndex = firstIndexByName.get(item.name);
      if (firstIndex === undefined) {
        firstIndexByName.set(item.name, index);
        return;
      }
      // One issue per duplicate *occurrence*, so a triple-declared name reports
      // twice and every offending index is actionable.
      ctx.addIssue({
        code: "custom",
        // `addIssue` takes a raw issue, whose text field is `message`. (The
        // `error` param that replaced `message` in Zod 4 is a *schema* param,
        // used by `.refine()` / `.min()` elsewhere in this tree.)
        message: `Duplicate registry item name "${item.name}" (first declared at items[${String(firstIndex)}]).`,
        path: ["items", index, "name"],
      });
    });
  });

export type QpRegistry = z.infer<typeof qpRegistrySchema>;

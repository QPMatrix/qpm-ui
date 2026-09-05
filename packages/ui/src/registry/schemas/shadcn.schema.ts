import { z } from "zod";

/**
 * Schemas for the shadcn-compatible manifests QPMatrix *emits*.
 *
 * These are not the canonical vocabulary — see `registry-item.schema.ts` for
 * that. They exist so `registry:build` validates its own projection before
 * writing `registry.json`, instead of discovering a malformed manifest when a
 * consumer runs `shadcn add`.
 */

export const SHADCN_REGISTRY_SCHEMA_URL = "https://ui.shadcn.com/schema/registry.json";

export const SHADCN_ITEM_TYPES = [
  "registry:ui",
  "registry:block",
  "registry:lib",
  "registry:hook",
  "registry:theme",
] as const;

export const shadcnItemTypeSchema = z.enum(SHADCN_ITEM_TYPES);
export type ShadcnItemType = z.infer<typeof shadcnItemTypeSchema>;

export const shadcnRegistryFileSchema = z.strictObject({
  /** Path relative to the `registry.json` that declares the item. */
  path: z.string().min(1, { error: "File `path` must not be empty." }),
  type: shadcnItemTypeSchema,
  target: z.string().min(1, { error: "File `target` must not be empty when present." }).optional(),
});

export type ShadcnRegistryFile = z.infer<typeof shadcnRegistryFileSchema>;

export const shadcnRegistryItemSchema = z.strictObject({
  name: z.string().min(1, { error: "Item `name` must not be empty." }),
  type: shadcnItemTypeSchema,
  title: z.string().min(1, { error: "Item `title` must not be empty when present." }).optional(),
  description: z.string().min(1, { error: "Item `description` must not be empty." }),
  dependencies: z.array(z.string().min(1)).optional(),
  registryDependencies: z.array(z.string().min(1)).optional(),
  files: z
    .array(shadcnRegistryFileSchema)
    .min(1, { error: "A shadcn item must declare at least one file." }),
});

export type ShadcnRegistryItem = z.infer<typeof shadcnRegistryItemSchema>;

export const shadcnRegistrySchema = z.strictObject({
  $schema: z.literal(SHADCN_REGISTRY_SCHEMA_URL),
  name: z.string().min(1, { error: "Registry `name` must not be empty." }),
  homepage: z.url({ error: "Registry `homepage` must be an absolute URL." }),
  items: z.array(shadcnRegistryItemSchema),
});

export type ShadcnRegistry = z.infer<typeof shadcnRegistrySchema>;

/**
 * The repo-root `registry.json`. GitHub source registries always resolve the
 * ROOT `registry.json`, so this file is what makes
 * `bunx shadcn@latest add QPMatrix/qpm-ui/<item>` work with no build
 * step. It only points at the real manifest inside `packages/ui`.
 */
export const shadcnRootRegistrySchema = z.strictObject({
  $schema: z.literal(SHADCN_REGISTRY_SCHEMA_URL),
  name: z.string().min(1, { error: "Registry `name` must not be empty." }),
  homepage: z.url({ error: "Registry `homepage` must be an absolute URL." }),
  include: z
    .array(z.string().min(1))
    .min(1, { error: "The root registry must include at least one registry file." }),
});

export type ShadcnRootRegistry = z.infer<typeof shadcnRootRegistrySchema>;

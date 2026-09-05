import packageJson from "../../package.json" with { type: "json" };
import { QP_REGISTRY_ITEMS } from "./items/index";
import { qpRegistrySchema, type QpRegistry } from "./schemas/registry.schema";

/**
 * The canonical QPMatrix registry value.
 *
 * Assembled here, in ONE place, so every consumer of the registry — the
 * validator, the manifest builder, the single-item checker, the preview server
 * — sees the same envelope. A CLI that built its own envelope inline could
 * validate a registry that is not the registry it later writes to disk.
 *
 * The version tracks the package version rather than being maintained
 * separately: a registry is only ever published as part of a `@qpmtx/ui`
 * release, so two numbers would only ever be an opportunity to disagree.
 */
export const QP_REGISTRY_NAME = "@qpmtx/ui";
export const QP_REGISTRY_HOMEPAGE = "https://github.com/QPMatrix/qpm-ui";

export const QP_REGISTRY_VALUE = {
  name: QP_REGISTRY_NAME,
  homepage: QP_REGISTRY_HOMEPAGE,
  version: packageJson.version,
  items: QP_REGISTRY_ITEMS,
};

/**
 * The registry, parsed through zod.
 *
 * `QP_REGISTRY_VALUE` is only *typed* as a registry — TypeScript checks the
 * shape of the literals, but it cannot check that `version` is real semver,
 * that a name is kebab-case, that an interactive item claims keyboard testing,
 * or that two items do not share a name. Those live in the schema, and this is
 * where they run.
 *
 * Throws on a malformed registry. The CLIs deliberately do NOT call this
 * directly: they use `safeParse` through `validate()` so a schema failure is
 * reported as an attributed, per-item issue rather than one stack trace.
 */
export function parseRegistry(): QpRegistry {
  return qpRegistrySchema.parse(QP_REGISTRY_VALUE);
}

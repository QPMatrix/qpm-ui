import { type QpItemType, type QpRegistryItem } from "../schemas/registry-item.schema";
import { type QpRegistry } from "../schemas/registry.schema";
import {
  SHADCN_REGISTRY_SCHEMA_URL,
  type ShadcnItemType,
  type ShadcnRegistry,
  type ShadcnRegistryFile,
  type ShadcnRegistryItem,
} from "../schemas/shadcn.schema";

/**
 * Canonical QPMatrix item -> shadcn item projection.
 *
 * Deterministic and total: every canonical type has exactly one shadcn type,
 * and the same input always produces byte-identical output. `registry:build`
 * relies on that to diff generated manifests against the checked-in ones.
 */

/** The GitHub source registry consumers install from. */
export const QP_GITHUB_REGISTRY = "QPMatrix/qpm-ui";

export const QP_TYPE_TO_SHADCN_TYPE: Readonly<Record<QpItemType, ShadcnItemType>> = {
  component: "registry:ui",
  primitive: "registry:ui",
  hook: "registry:hook",
  utility: "registry:lib",
  pattern: "registry:block",
  "form-pattern": "registry:block",
  "token-extension": "registry:theme",
};

export interface ProjectionOptions {
  /**
   * Repo-root-relative prefix stripped from every file path, because shadcn
   * resolves item file paths relative to the `registry.json` that declares
   * them. For `packages/ui/registry.json` this is `packages/ui/`.
   */
  readonly pathPrefix: string;
  /** Item names that live in THIS registry (used to rewrite dependency addresses). */
  readonly localItemNames: ReadonlySet<string>;
  /** GitHub `owner/repo` this registry is served from. */
  readonly githubRegistry?: string;
  /**
   * Namespace this registry is served under, e.g. `@qp`.
   *
   * When set, a LOCAL dependency projects to `@qp/card` instead of
   * `QPMatrix/qpm-ui/card`. A registry hosted at a URL (rather than
   * resolved from GitHub) must do this, or the CLI goes looking for the
   * dependency on GitHub while installing from localhost — which is how a
   * self-hosted or previewed registry silently half-installs.
   *
   * Takes precedence over `githubRegistry`.
   */
  readonly namespace?: string;
}

/** `radio-group` -> `Radio Group`. */
export function titleFromName(name: string): string {
  return name
    .split("-")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * Codepoint ordering. `localeCompare` is locale-sensitive, and generated
 * manifests must be byte-identical on every machine that runs `registry:build`.
 */
export function compareStrings(a: string, b: string): number {
  if (a === b) {
    return 0;
  }
  return a < b ? -1 : 1;
}

function stripPrefix(path: string, prefix: string): string {
  return path.startsWith(prefix) ? path.slice(prefix.length) : path;
}

/**
 * Rewrite a canonical `registryDependencies` entry into a shadcn *address*.
 *
 * shadcn treats a bare name as an OFFICIAL shadcn item — bare names never mean
 * "same repository". So a reference to one of our own items must be emitted as
 * a GitHub address, otherwise `shadcn add QPMatrix/qpm-ui/dialog`
 * would silently pull upstream shadcn's `button` instead of ours. Entries that
 * are already addresses (or genuinely refer to upstream shadcn) pass through.
 */
export function projectRegistryDependency(entry: string, options: ProjectionOptions): string {
  if (!options.localItemNames.has(entry)) {
    return entry;
  }
  if (options.namespace !== undefined) {
    return `${options.namespace}/${entry}`;
  }
  const registry = options.githubRegistry ?? QP_GITHUB_REGISTRY;
  return `${registry}/${entry}`;
}

/**
 * Rewrite a file's relative imports for a FLAT install.
 *
 * shadcn puts every `registry:ui` file directly in the consumer's `ui`
 * directory, discarding the source folder structure. A component that imports a
 * SIBLING component folder (`../text`, `../heading/heading.types`) therefore
 * arrives with a specifier pointing at a directory that does not exist — the
 * sibling's files are right beside it instead.
 *
 * Flattening the specifier is exact, not approximate: `../text/text.types`
 * becomes `./text.types`, and `text.types.ts` is installed in the same
 * directory because it is pulled in as a registryDependency. `../text` becomes
 * `./text`, which resolves to the flattened `text.tsx`.
 *
 * `../ui/*`, `../../lib/*` and `../../hooks/*` are left ALONE: those land in
 * their own alias directories, so the authored specifier is already correct.
 *
 * The rewrite happens at projection time, so this repo keeps the folder layout
 * it is easier to read and maintain, and consumers get files that compile.
 */
export function flattenRelativeImports(source: string): string {
  /*
   * `../../lib/<folder>/<file>` is deliberately NOT rewritten.
   *
   * shadcn flattens `registry:ui` files into the consumer's ui directory, but
   * it PRESERVES the subfolder for `registry:lib` files — verified by
   * installing ten components into a scratch app: `motion-core`'s files landed
   * at `src/lib/motion/motion-core.*`, exactly mirroring the source. So the
   * authored specifier is already correct, and an earlier attempt to flatten
   * it produced the broken imports that proved this.
   */
  return source.replace(
    /(from\s*["'])\.\.\/(?!ui\/|\.\.\/)([a-z][a-z0-9-]*)(\/[a-zA-Z0-9._-]+)?(["'])/g,
    (_match, head: string, folder: string, file: string | undefined, tail: string) =>
      `${head}./${file === undefined ? folder : file.slice(1)}${tail}`,
  );
}

export function projectItem(item: QpRegistryItem, options: ProjectionOptions): ShadcnRegistryItem {
  const type = QP_TYPE_TO_SHADCN_TYPE[item.type];

  /*
   * No derived `target`. shadcn resolves a `registry:ui` file to the
   * consumer's `ui` alias, which is what we want; an explicit target is
   * resolved against the PROJECT ROOT instead, with no alias-relative form
   * available. Proven empirically by installing into a scratch app: a
   * `~/components/<name>/…` target landed at `<root>/components/<name>/…`,
   * outside the app's `src/`, breaking every relative import in the file.
   *
   * Flat placement keeps the authored relative imports correct — from
   * `components/ui/metric-card.tsx`, `../../lib/utils` and `../ui/card` both
   * resolve exactly as they do in this repo. The barrel that WOULD collide is
   * excluded from distribution instead; see `isDistributable` in paths.ts.
   */
  const files: ShadcnRegistryFile[] = item.files.map((file) => ({
    path: stripPrefix(file.path, options.pathPrefix),
    type,
    ...(file.target === undefined ? {} : { target: file.target }),
  }));

  const dependencies = [...item.dependencies].sort(compareStrings);
  const registryDependencies = [
    ...new Set(item.registryDependencies.map((entry) => projectRegistryDependency(entry, options))),
  ].sort(compareStrings);

  return {
    name: item.name,
    type,
    title: titleFromName(item.name),
    description: item.description,
    ...(dependencies.length === 0 ? {} : { dependencies }),
    ...(registryDependencies.length === 0 ? {} : { registryDependencies }),
    files,
  };
}

export function projectRegistry(
  registry: QpRegistry,
  options: Omit<ProjectionOptions, "localItemNames"> & { localItemNames?: ReadonlySet<string> },
): ShadcnRegistry {
  const resolved: ProjectionOptions = {
    pathPrefix: options.pathPrefix,
    localItemNames: options.localItemNames ?? new Set(registry.items.map((item) => item.name)),
    ...(options.githubRegistry === undefined ? {} : { githubRegistry: options.githubRegistry }),
    ...(options.namespace === undefined ? {} : { namespace: options.namespace }),
  };

  return {
    $schema: SHADCN_REGISTRY_SCHEMA_URL,
    name: registry.name,
    homepage: registry.homepage,
    items: [...registry.items]
      .sort((a, b) => compareStrings(a.name, b.name))
      .map((item) => projectItem(item, resolved)),
  };
}

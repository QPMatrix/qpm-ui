import { join, relative, resolve, sep } from "node:path";

/**
 * Every path in the registry tooling is resolved from THIS file's location, not
 * from `process.cwd()`. `bun run registry:validate` from the git root, from
 * `packages/ui`, or from a `bun test` worker must all see the same repo.
 */
const UTILS_DIR = import.meta.dir;

/** `<git-root>` — five levels up from `packages/ui/src/registry/utils`. */
export const GIT_ROOT = resolve(UTILS_DIR, "..", "..", "..", "..", "..");

export const UI_PACKAGE_DIR = resolve(GIT_ROOT, "packages", "ui");

export const TOKENS_GROUPS_DIR = resolve(GIT_ROOT, "packages", "tokens", "src", "groups");

/** Repo-root-relative prefix of the package that owns the registry. */
export const UI_PACKAGE_PREFIX = "packages/ui/";

/** The token adapter that maps shadcn CSS var names onto @qpmatrix/tokens roles. */
export const UI_CSS_PATH = "packages/ui/styles/qpmatrix.css";

/** Where the generated shadcn manifests live. */
export const UI_REGISTRY_MANIFEST_PATH = "packages/ui/registry.json";
export const ROOT_REGISTRY_MANIFEST_PATH = "registry.json";

/**
 * The roots a registry item may claim files from. Anything matching these and
 * not claimed by exactly one item fails the `unclaimed-file` rule, so adding a
 * component without adding its item is a hard error rather than a silent gap.
 */
export const REGISTRY_FILE_GLOBS: readonly string[] = [
  // shadcn primitives: one flat file each, the path contract the shadcn CLI
  // writes to and re-resolves on `shadcn update`.
  "packages/ui/src/components/ui/*.tsx",
  // QPMatrix components: one folder each, holding markup, .types.ts,
  // .constants.ts, .utils.ts and the barrel. Tests and stories are excluded
  // by `isTestFile` — they are not distributed, so no item claims them.
  "packages/ui/src/components/*/*.ts",
  "packages/ui/src/components/*/*.tsx",
  "packages/ui/src/lib/*.ts",
  // The motion foundation is a nested lib module, not a loose file.
  "packages/ui/src/lib/*/*.ts",
  // Hooks are distributable too — `sidebar` depends on `use-mobile`, and a
  // dependency on an unregistered file is a broken `shadcn add` for a consumer.
  "packages/ui/src/hooks/*.ts",
];

/** Everything committed under the package's `src/`, for source-level rules. */
export const SOURCE_FILE_GLOBS: readonly string[] = [
  "packages/ui/src/**/*.ts",
  "packages/ui/src/**/*.tsx",
];

export function toPosix(path: string): string {
  return sep === "/" ? path : path.split(sep).join("/");
}

/** Repo-root-relative POSIX path -> absolute path. */
export function absolutePathFor(repoRelativePath: string): string {
  return join(GIT_ROOT, ...repoRelativePath.split("/"));
}

/** Absolute path -> repo-root-relative POSIX path. */
export function repoRelativePathFor(absolutePath: string): string {
  return toPosix(relative(GIT_ROOT, absolutePath));
}

/**
 * Files that exist to PROVE a component works rather than to ship it.
 *
 * Tests and stories sit inside the component folder — that is the point of the
 * folder — but a consumer running `shadcn add` must not receive them: they
 * import `bun:test`, `@testing-library/*` and `@storybook/react-vite`, none of
 * which are dependencies of the published package. Excluding them here is what
 * lets `unclaimed-file` demand that every OTHER file in the folder is claimed.
 */
export function isTestFile(repoRelativePath: string): boolean {
  return /\.(test|stories)\.tsx?$/.test(repoRelativePath);
}

/**
 * Is this a component-folder barrel?
 *
 * `src/components/<name>/index.ts` is a convenience for THIS package: it lets
 * `src/index.ts` re-export a folder without naming four files. It is not a
 * distributable unit, and shipping it through the registry is actively
 * harmful — proven by installing into a scratch app:
 *
 *   shadcn resolves a `registry:ui` file to the consumer's `ui` alias
 *   directory, FLAT. Every component's barrel is called `index.ts`, so they
 *   all land at `components/ui/index.ts` and each install silently overwrites
 *   the last one's barrel. Two components installed, one barrel survived.
 *
 * An explicit `target` does not fix it: shadcn resolves targets against the
 * project ROOT with no alias-relative form, so `~/components/<name>/index.ts`
 * lands outside the app's `src/` and breaks every relative import in the file.
 *
 * Flat placement is otherwise correct — `../../lib/utils` and `../ui/card`
 * resolve identically in a consumer's `components/ui/` as they do here. So the
 * barrel is excluded from distribution and the other four files ship as-is.
 * A source-install consumer imports from the file; the npm package still
 * exports the folder.
 */
export function isFolderBarrel(repoRelativePath: string): boolean {
  return /\/src\/(?:components|lib)\/[a-z][a-z0-9-]*\/index\.ts$/.test(repoRelativePath);
}

/**
 * Should a registry item claim this file?
 *
 * Tests and stories prove a component; barrels wire it up locally. Neither
 * ships.
 */
export function isDistributable(repoRelativePath: string): boolean {
  return !isTestFile(repoRelativePath) && !isFolderBarrel(repoRelativePath);
}

export async function listFiles(globs: readonly string[]): Promise<string[]> {
  const matches = new Set<string>();
  for (const pattern of globs) {
    const glob = new Bun.Glob(pattern);
    for await (const match of glob.scan({ cwd: GIT_ROOT, onlyFiles: true })) {
      matches.add(toPosix(match));
    }
  }
  return [...matches].sort();
}

/** Source files a registry item is expected to claim (tests are never items). */
export async function listRegistryFiles(): Promise<string[]> {
  const files = await listFiles(REGISTRY_FILE_GLOBS);
  return files.filter((file) => isDistributable(file));
}

export async function listSourceFiles(): Promise<string[]> {
  return listFiles(SOURCE_FILE_GLOBS);
}

export async function readTextIfExists(repoRelativePath: string): Promise<string | null> {
  const file = Bun.file(absolutePathFor(repoRelativePath));
  if (!(await file.exists())) {
    return null;
  }
  return file.text();
}

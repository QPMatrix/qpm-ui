import { listRegistryFiles, listSourceFiles, readTextIfExists } from "./paths";
import { loadKnownTokenNames } from "./tokens";

/**
 * All disk state the validator needs, read once.
 *
 * `validate()` is a pure function of (registry, snapshot). Every filesystem
 * read happens here so the rules can be unit-tested against a hand-built
 * snapshot, and so a validation run can never observe a half-changed tree.
 */
export interface RegistrySnapshot {
  /** Repo-root-relative POSIX path -> file contents. Absent key means absent file. */
  readonly files: ReadonlyMap<string, string>;
  /** Source files under the registry roots that an item is expected to claim. */
  readonly registryFiles: readonly string[];
  /** Every committed `.ts`/`.tsx` under `packages/ui/src`. */
  readonly sourceFiles: readonly string[];
  /** Custom-property names @qpmatrix/tokens ships, without the leading `--`. */
  readonly knownTokens: ReadonlySet<string>;
}

/**
 * @param declaredPaths Extra repo-root-relative paths to read, typically every
 * path the registry items declare. Paths that do not exist are simply absent
 * from `files`, which is what the `missing-file` rule reports on.
 */
export async function loadSnapshot(
  declaredPaths: readonly string[] = [],
): Promise<RegistrySnapshot> {
  const [registryFiles, sourceFiles, knownTokens] = await Promise.all([
    listRegistryFiles(),
    listSourceFiles(),
    loadKnownTokenNames(),
  ]);

  const wanted = [...new Set([...registryFiles, ...sourceFiles, ...declaredPaths])].sort();
  const contents = await Promise.all(wanted.map((path) => readTextIfExists(path)));

  const files = new Map<string, string>();
  wanted.forEach((path, index) => {
    const content = contents[index];
    if (content !== undefined && content !== null) {
      files.set(path, content);
    }
  });

  return { files, registryFiles, sourceFiles, knownTokens };
}

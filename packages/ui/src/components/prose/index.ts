/**
 * QPProse — public surface of this folder.
 *
 * Consumers import from the folder, never from a file inside it, so the
 * markup/types/constants/utils split stays an implementation detail.
 */
export * from "./prose";
export * from "./prose.constants";
export type * from "./prose.types";
export * from "./prose.utils";

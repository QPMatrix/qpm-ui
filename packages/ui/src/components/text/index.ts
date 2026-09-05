/**
 * QPText — public surface of this folder.
 *
 * Consumers import from the folder, never from a file inside it, so the
 * markup/types/constants/utils split stays an implementation detail.
 */
export * from "./text";
export * from "./text.constants";
export type * from "./text.types";
export * from "./text.utils";

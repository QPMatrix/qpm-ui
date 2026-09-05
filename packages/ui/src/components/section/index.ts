/**
 * QPSection — public surface of this folder.
 *
 * Consumers import from the folder, never from a file inside it, so the
 * markup/types/constants/utils split stays an implementation detail.
 */
export * from "./section";
export * from "./section.constants";
export type * from "./section.types";
export * from "./section.utils";

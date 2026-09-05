/**
 * QPHeading — public surface of this folder.
 *
 * Consumers import from the folder, never from a file inside it, so the
 * markup/types/constants/utils split stays an implementation detail.
 */
export * from "./heading";
export * from "./heading.constants";
export type * from "./heading.types";
export * from "./heading.utils";

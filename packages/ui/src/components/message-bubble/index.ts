/**
 * QPMessageBubble — public surface of this folder.
 *
 * Consumers import from the folder, never from a file inside it, so the
 * markup/types/constants/utils split stays an implementation detail.
 */
export * from "./message-bubble";
export * from "./message-bubble.constants";
export type * from "./message-bubble.types";
export * from "./message-bubble.utils";

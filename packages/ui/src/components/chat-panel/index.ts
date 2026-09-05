/**
 * QPChatPanel — public surface of this folder.
 *
 * Consumers import from the folder, never from a file inside it, so the
 * markup/types/constants/utils split stays an implementation detail.
 */
export * from "./chat-panel";
export * from "./chat-panel.constants";
export type * from "./chat-panel.types";
export * from "./chat-panel.utils";

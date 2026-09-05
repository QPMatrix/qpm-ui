import { QP_MESSAGE_BUBBLE_AUTHOR_LABELS } from "./message-bubble.constants";
import type { QPMessageAuthor } from "./message-bubble.types";

/**
 * QPMessageBubble — pure helpers.
 */

/**
 * Resolve the author's accessible name, in override order:
 * explicit `authorLabel` → the caller's `authorLabels` map → the English
 * fallback.
 *
 * The three-step order matters and is easy to get backwards inline: a caller
 * who passes both a per-message name ("Layla") and a locale map must get the
 * per-message one, because the map describes *roles* and the explicit label
 * describes *this speaker*.
 */
export function qpResolveMessageAuthorLabel(
  author: QPMessageAuthor,
  authorLabel: string | undefined,
  authorLabels: Partial<Record<QPMessageAuthor, string>> | undefined,
): string {
  return authorLabel ?? authorLabels?.[author] ?? QP_MESSAGE_BUBBLE_AUTHOR_LABELS[author];
}

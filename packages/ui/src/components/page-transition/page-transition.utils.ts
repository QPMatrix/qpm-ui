/**
 * QPPageTransition — pure helpers.
 */

/**
 * Is this key usable as an AnimatePresence identity?
 *
 * The single most common way a page transition silently does nothing: React
 * reuses the same element across routes unless the `key` changes, so nothing
 * unmounts, so the exit animation never runs. A constant or empty key is
 * therefore not a styling nit — it means the feature is off. Returning false
 * lets the component say so instead of rendering a transition that never plays.
 */
export function qpIsUsablePageKey(pageKey: string): boolean {
  return pageKey.trim().length > 0;
}

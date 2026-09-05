import { useSyncExternalStore } from "react";

/**
 * The viewport width below which the UI switches to its mobile arrangement.
 *
 * Matches `--breakpoint-tablet` in @qpmatrix/tokens. It is duplicated as a
 * number here because a media query cannot read a CSS custom property — a
 * token cannot be interpolated into `matchMedia`. Change one, change both.
 */
const MOBILE_BREAKPOINT = 768;

const MOBILE_QUERY = `(max-width: ${String(MOBILE_BREAKPOINT - 1)}px)`;

/**
 * Subscribe to a media query.
 *
 * Returned as a stable function identity so `useSyncExternalStore` does not
 * resubscribe on every render.
 */
function subscribe(onStoreChange: () => void): () => void {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener("change", onStoreChange);
  return () => {
    query.removeEventListener("change", onStoreChange);
  };
}

function getSnapshot(): boolean {
  return window.matchMedia(MOBILE_QUERY).matches;
}

/**
 * The server snapshot.
 *
 * There is no viewport during SSR, so any answer is a guess. Guessing
 * "desktop" is the right guess: it is the more common case, and — more
 * importantly — the mobile arrangement typically means a drawer or a collapsed
 * sidebar, so guessing mobile renders a closed navigation that then pops open
 * on hydration. Guessing desktop degrades to a layout that is merely wide for
 * one frame.
 */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Is the viewport in the mobile range?
 *
 * Built on `useSyncExternalStore` rather than `useState` + `useEffect`, which
 * is what the shadcn original uses. Three concrete reasons, all of which the
 * effect-based version gets wrong:
 *
 *   1. **No `undefined` first render.** The effect version starts as
 *      `undefined` and coerces to `false`, so every consumer renders one frame
 *      of desktop layout before correcting — a visible flash on a phone.
 *   2. **No hydration mismatch.** React calls `getServerSnapshot` on the
 *      server and during hydration, and `getSnapshot` afterwards, so the
 *      transition is a state change React expects rather than a mismatch it
 *      warns about.
 *   3. **It reads the media query, not `innerWidth`.** The original listens to
 *      a `matchMedia` change event but then measures `window.innerWidth`,
 *      which can disagree with the query at the boundary (scrollbar width, zoom)
 *      and produces an off-by-one-pixel state that never settles.
 *
 * Consumers get a plain boolean; nothing about the implementation leaks.
 */
export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export { MOBILE_BREAKPOINT };

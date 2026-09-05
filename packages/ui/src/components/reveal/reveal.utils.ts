/**
 * QPReveal — pure helpers.
 */

/**
 * The viewport options Motion needs.
 *
 * `once` is the inverse of the public `repeat` prop, and defaults to replaying
 * NEVER. That is a usability decision, not a performance one: content that
 * re-animates every time it re-enters the viewport makes a page feel unstable
 * and actively punishes a reader for scrolling back to re-read something.
 */
export function qpRevealViewport(options: { repeat: boolean; amount: number }): {
  once: boolean;
  amount: number;
} {
  return { once: !options.repeat, amount: options.amount };
}

"use client";

import { useSyncExternalStore } from "react";

import { QP_REDUCED_MOTION_ATTRIBUTE } from "./motion-core.constants";
import { qpHasRootReducedMotionOverride } from "./motion-core.utils";

/**
 * QPMatrix motion system — the one stateful hook it needs.
 *
 * Everything else in `lib/motion` is pure by design (see the doc comment atop
 * `motion-core.utils.ts`): this file is the deliberate, single exception,
 * kept in its own module so `motion-core.utils.ts` never gains a React
 * import.
 */

function subscribe(onStoreChange: () => void): () => void {
  if (typeof document === "undefined" || typeof MutationObserver === "undefined") {
    // SSR, or a test environment with no MutationObserver: the snapshot below
    // already returns `false` in both cases, so there is nothing to observe.
    return () => {};
  }
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [QP_REDUCED_MOTION_ATTRIBUTE],
  });
  return () => {
    observer.disconnect();
  };
}

function getSnapshot(): boolean {
  return qpHasRootReducedMotionOverride(typeof document === "undefined" ? undefined : document);
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Live view of the in-app reduced-motion override `QPDisplayPreferences`
 * writes to the document root.
 *
 * Every QPMatrix motion component (`QPMotion`, `QPReveal`, `QPStagger`,
 * `QPPageTransition`) combines this with `useReducedMotion()`'s OS-level
 * result through `qpEffectiveReducedMotion` — either source asking for less
 * motion is enough to strip it. `useSyncExternalStore` is what makes an
 * already-mounted animation react the moment the attribute changes, rather
 * than only on the next unrelated re-render.
 */
export function useQpRootReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

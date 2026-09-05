import { environmentManager, QueryClient } from "@tanstack/react-query";

/** Cache stays fresh for 30s by default — long enough to dedupe bursts of renders, short enough not to hide real changes. */
const DEFAULT_STALE_TIME_MS = 30 * 1000;

export interface QueryClientOptions {
  /** Overrides the package default of 30s. */
  staleTime?: number;
}

function makeQueryClient(options: QueryClientOptions): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: options.staleTime ?? DEFAULT_STALE_TIME_MS,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * The one place an app gets a `QueryClient` — the standard Next.js App Router pattern
 * (see `@tanstack/react-query`'s `environmentManager.isServer()` — the plain `isServer`
 * boolean export is deprecated as of the pinned v5.101.4):
 *
 * - **Server**: always builds a fresh client. Server rendering is per-request; sharing a
 *   client across requests would leak one user's cached data into another's response.
 * - **Browser**: builds the client once and reuses it for the lifetime of the tab. React
 *   can re-run a component during Suspense, so a plain module-level `new QueryClient()`
 *   would otherwise throw the cache away on every re-render.
 *
 * Aliased as `ensureQueryClient` — call whichever name reads better at the call site, both
 * do the same thing.
 */
export function getQueryClient(options: QueryClientOptions = {}): QueryClient {
  if (environmentManager.isServer()) {
    return makeQueryClient(options);
  }

  browserQueryClient ??= makeQueryClient(options);
  return browserQueryClient;
}

export const ensureQueryClient = getQueryClient;

/**
 * Test-only escape hatch: clears the browser singleton so each test starts from a clean
 * client instead of leaking state across `getQueryClient()` calls in the same process.
 */
export function __resetBrowserQueryClientForTests(): void {
  browserQueryClient = undefined;
}

import {
  dehydrate,
  type DehydratedState,
  type FetchQueryOptions,
  type QueryClient,
} from "@tanstack/react-query";

export { HydrationBoundary } from "@tanstack/react-query";
export type { DehydratedState, HydrationBoundaryProps } from "@tanstack/react-query";

/**
 * Prefetches one query on the given client — call this in a Server Component before
 * rendering the `HydrationBoundary` that wraps the client tree needing the data. `options`
 * is whatever `defineQuery(...)(...)` returns, so the same query definition that powers
 * `useQuery`/`useSuspenseQuery` on the client also drives server prefetch. To prefetch
 * several queries in parallel, call this multiple times inside `Promise.all([...])` — one
 * `dehydrateState` call afterwards captures everything that landed in the cache.
 */
export async function prefetchQuery<TResponse>(
  client: QueryClient,
  options: FetchQueryOptions<TResponse>,
): Promise<void> {
  await client.prefetchQuery(options);
}

/**
 * Serializes everything currently in the client's cache — call after your `prefetchQuery`
 * call(s), and pass the result as `<HydrationBoundary state={...}>`'s `state` prop so the
 * client picks up the prefetched data without refetching it.
 */
export function dehydrateState(client: QueryClient): DehydratedState {
  return dehydrate(client);
}

import { queryOptions, type QueryKey } from "@tanstack/react-query";

import type { Fetcher, FetchRequestConfig } from "./fetcher";

/**
 * Builds a typed, stable query key tuple. Prefer this over a hand-rolled array literal so
 * keys stay comparable by value and every segment is captured in the returned type.
 */
export function queryKey<const T extends readonly unknown[]>(...segments: T): T {
  return segments;
}

export interface DefineQueryConfig<TResponse, TArgs extends readonly unknown[]> {
  /** Builds this query's cache key from the same arguments passed to the returned function. */
  queryKey: (...args: TArgs) => QueryKey;
  /** Builds the fetcher request config from the same arguments. `signal` is supplied automatically. */
  request: (...args: TArgs) => Omit<FetchRequestConfig<TResponse>, "signal">;
  /**
   * Per-query `staleTime` override. Omit it and the `QueryClient`'s own default applies
   * (30s — see `getQueryClient`) — the cache default lives in one place, the client, not
   * copy-pasted into every query definition.
   */
  staleTime?: number;
}

/**
 * Defines a typed query once — key, request, and response schema — and returns a function
 * that produces TanStack Query `queryOptions`, ready for `useQuery`, `useSuspenseQuery`, or
 * `prefetchQuery`. This is the only sanctioned way apps build a query key/queryFn pair —
 * they call the returned function with the same arguments the key is derived from, never
 * hand-write either.
 */
export function defineQuery<TResponse, TArgs extends readonly unknown[] = []>(
  fetcher: Fetcher,
  config: DefineQueryConfig<TResponse, TArgs>,
) {
  return (...args: TArgs) =>
    queryOptions({
      queryKey: config.queryKey(...args),
      queryFn: ({ signal }) => fetcher.request({ ...config.request(...args), signal }),
      ...(config.staleTime !== undefined ? { staleTime: config.staleTime } : {}),
    });
}

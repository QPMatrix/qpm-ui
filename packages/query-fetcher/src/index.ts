// Fetcher core
export { createFetcher } from "./fetcher";
export type {
  Fetcher,
  FetcherConfig,
  FetchRequestConfig,
  HttpMethod,
  QueryParamValue,
} from "./fetcher";

// Errors
export { ErrorEnvelopeSchema, QueryFetcherError, QueryFetcherErrorCode } from "./errors";
export type { ErrorEnvelope } from "./errors";

// SSR-safe QueryClient (per-request on the server, singleton in the browser)
export { ensureQueryClient, getQueryClient } from "./query-client";
export type { QueryClientOptions } from "./query-client";

// Server-prefetch + hydration flow
export { dehydrateState, HydrationBoundary, prefetchQuery } from "./hydration";
export type { DehydratedState, HydrationBoundaryProps } from "./hydration";

// Typed query keys + queryOptions
export { defineQuery, queryKey } from "./query-options";
export type { DefineQueryConfig } from "./query-options";

// Typed mutations
export { defineMutation } from "./mutation";
export type { DefineMutationConfig } from "./mutation";

// The only sanctioned way to reach TanStack Query's own primitives — apps import them from
// here, never from `@tanstack/react-query` directly (same boundary pattern as `@qpmatrix/ui`
// for MUI, ADR-005).
export {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
export type {
  QueryClientProviderProps,
  UseMutationResult,
  UseQueryResult,
  UseSuspenseQueryResult,
} from "@tanstack/react-query";

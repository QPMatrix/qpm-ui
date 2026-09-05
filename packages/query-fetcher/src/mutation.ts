import { mutationOptions, type MutationKey } from "@tanstack/react-query";

import type { Fetcher, FetchRequestConfig } from "./fetcher";

export interface DefineMutationConfig<TResponse, TVariables = void, TBody = TVariables> {
  /** Required by TanStack Query's `mutationOptions` — also what `useMutationState`/devtools group by. */
  mutationKey: MutationKey;
  /** Builds the fetcher request config from the mutation's variables. */
  request: (variables: TVariables) => Omit<FetchRequestConfig<TResponse, TBody>, "signal">;
}

/**
 * Defines a typed mutation once — key, request, and response schema — and returns
 * TanStack Query `mutationOptions`, ready for `useMutation(defineMutation(...))`. Apps
 * pair this with `queryClient.invalidateQueries(...)` in `onSuccess` to keep affected
 * queries fresh; that stays app-specific and is deliberately not baked in here.
 */
export function defineMutation<TResponse, TVariables = void, TBody = TVariables>(
  fetcher: Fetcher,
  config: DefineMutationConfig<TResponse, TVariables, TBody>,
) {
  return mutationOptions<TResponse, Error, TVariables>({
    mutationKey: config.mutationKey,
    mutationFn: (variables) => fetcher.request<TResponse, TBody>(config.request(variables)),
  });
}

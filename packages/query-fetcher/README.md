# @qpmtx/query-fetcher

The one typed way QPMatrix frontends talk to the API. Wraps `fetch` with zod-validated
request/response bodies, the standard error envelope, and abort/timeout support, plus a thin
TanStack Query integration layer (typed query keys, `queryOptions`/`mutationOptions` helpers,
SSR-safe `QueryClient` + prefetch/hydration flow for the Next.js App Router).

Per ADR-005 and the `@qpmtx/ui`-only pattern for MUI: **apps never call `fetch` or import
from `@tanstack/react-query` directly.** Everything — the fetcher, the query client, `useQuery`,
`useMutation`, `HydrationBoundary`, all of it — comes from this package.

## Install

```sh
bun add @qpmtx/query-fetcher @tanstack/react-query react
```

`@tanstack/react-query` and `react` are peer dependencies — the app's own versions are used.

## Set up the fetcher once

```ts
// lib/api.ts
import { createFetcher } from "@qpmtx/query-fetcher";

export const apiFetcher = createFetcher({
  baseUrl: process.env.NEXT_PUBLIC_API_URL!,
  timeoutMs: 10_000,
});
```

## One query

```ts
// features/notes/notes.queries.ts
import { z } from "zod";
import { defineQuery, queryKey } from "@qpmtx/query-fetcher";
import { apiFetcher } from "@/lib/api";

const NoteSchema = z.object({ id: z.string(), title: z.string() });

export const noteQuery = defineQuery<z.infer<typeof NoteSchema>, [id: string]>(apiFetcher, {
  queryKey: (id) => queryKey("notes", id),
  request: (id) => ({ path: `/notes/${id}`, responseSchema: NoteSchema }),
});
```

```tsx
// app/notes/[id]/note-view.tsx  ("use client")
import { useQuery } from "@qpmtx/query-fetcher";
import { noteQuery } from "@/features/notes/notes.queries";

export function NoteView({ id }: { id: string }) {
  const { data, status } = useQuery(noteQuery(id));

  if (status === "pending") return <p>Loading…</p>;
  if (status === "error") return <p>Couldn’t load this note.</p>;
  return <h1>{data.title}</h1>;
}
```

## One mutation

```ts
// features/notes/notes.mutations.ts
import { z } from "zod";
import { defineMutation } from "@qpmtx/query-fetcher";
import { apiFetcher } from "@/lib/api";

const NoteSchema = z.object({ id: z.string(), title: z.string() });
const CreateNoteInput = z.object({ title: z.string().min(1) });

export const createNoteMutation = defineMutation<
  z.infer<typeof NoteSchema>,
  z.infer<typeof CreateNoteInput>
>(apiFetcher, {
  mutationKey: ["notes", "create"],
  request: (variables) => ({
    method: "POST",
    path: "/notes",
    body: variables,
    bodySchema: CreateNoteInput,
    responseSchema: NoteSchema,
  }),
});
```

```tsx
// app/notes/new/create-note-form.tsx  ("use client")
import { useMutation, useQueryClient } from "@qpmtx/query-fetcher";
import { createNoteMutation } from "@/features/notes/notes.mutations";

export function CreateNoteForm() {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    ...createNoteMutation,
    onSuccess: () => {
      // Keep affected queries fresh — invalidation is app-specific, so it isn't baked
      // into `defineMutation` itself.
      void queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  return (
    <button disabled={isPending} onClick={() => mutate({ title: "Untitled" })}>
      Create note
    </button>
  );
}
```

## Server-side rendering (Next.js App Router)

The standard App Router pattern: a per-request `QueryClient` on the server, a stable singleton
in the browser, both from the same `getQueryClient()` call.

```ts
// lib/query-client.ts
import { getQueryClient } from "@qpmtx/query-fetcher";
export { getQueryClient };
```

Prefetch in a Server Component, then hydrate the client tree:

```tsx
// app/notes/[id]/page.tsx
import { HydrationBoundary, dehydrateState, prefetchQuery } from "@qpmtx/query-fetcher";
import { getQueryClient } from "@/lib/query-client";
import { noteQuery } from "@/features/notes/notes.queries";
import { NoteView } from "./note-view";

export default async function NotePage({ params }: { params: { id: string } }) {
  const queryClient = getQueryClient();
  await prefetchQuery(queryClient, noteQuery(params.id));

  return (
    <HydrationBoundary state={dehydrateState(queryClient)}>
      <NoteView id={params.id} />
    </HydrationBoundary>
  );
}
```

`NoteView` (a Client Component, shown above under "One query") picks up the prefetched data
from `useQuery` without an extra client-side fetch. To prefetch several queries in parallel,
call `prefetchQuery` multiple times inside `Promise.all([...])` before the one `dehydrateState`
call — `dehydrateState` captures everything currently in the client's cache, not just one query.

`getQueryClient()` is safe to call from Server Components, Route Handlers, and Client
Components alike:

- **On the server**, it always returns a brand-new `QueryClient` — server rendering is
  per-request, so a shared client would leak one user's cached data into another's response.
- **In the browser**, it returns the same singleton across calls, so the cache survives
  re-renders (including the ones React Suspense triggers).

The root layout still needs one `QueryClientProvider` for Client Components to read from:

```tsx
// app/providers.tsx  ("use client")
import { QueryClientProvider } from "@qpmtx/query-fetcher";
import { getQueryClient } from "@/lib/query-client";

export function Providers({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
```

## Error handling

Every failure — network, timeout/abort, invalid request/response body, or a server error —
throws a `QueryFetcherError` with `.status`, `.code`, and an optional `.requestId`. Server
errors are parsed from the standard envelope (`docs/architecture.md` Section 7):

```json
{ "error": { "code": "NOT_FOUND", "message": "note not found", "requestId": "req_01hxyz..." } }
```

```ts
import { QueryFetcherError } from "@qpmtx/query-fetcher";

try {
  await apiFetcher.request({ path: "/notes/missing", responseSchema: NoteSchema });
} catch (error) {
  if (error instanceof QueryFetcherError && error.code === "NOT_FOUND") {
    // handle it
  }
}
```

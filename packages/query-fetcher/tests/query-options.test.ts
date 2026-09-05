import { describe, expect, mock, test } from "bun:test";
import { z } from "zod";

import type { Fetcher } from "../src/fetcher";
import { defineQuery, queryKey } from "../src/query-options";

const NoteSchema = z.object({ id: z.string(), title: z.string() });

function fakeFetcher(result: unknown): Fetcher {
  return { request: mock(() => Promise.resolve(result)) as unknown as Fetcher["request"] };
}

describe("queryKey", () => {
  test("returns the segments as a typed tuple", () => {
    expect(queryKey("notes", "1")).toEqual(["notes", "1"]);
  });
});

describe("defineQuery", () => {
  test("derives queryOptions from the same arguments used for the key", () => {
    const fetcher = fakeFetcher({ id: "1", title: "Hello" });
    const notesQuery = defineQuery<z.infer<typeof NoteSchema>, [id: string]>(fetcher, {
      queryKey: (id) => queryKey("notes", id),
      request: (id) => ({ path: `/notes/${id}`, responseSchema: NoteSchema }),
    });

    const options = notesQuery("1");

    expect([...options.queryKey]).toEqual(["notes", "1"]);
    // No per-query override was given — the cache default lives on the QueryClient
    // (`getQueryClient`), not duplicated into every query definition.
    expect(options.staleTime).toBeUndefined();
  });

  test("queryFn calls the fetcher with the request built from the same args", async () => {
    const fetcher = fakeFetcher({ id: "1", title: "Hello" });
    const notesQuery = defineQuery<z.infer<typeof NoteSchema>, [id: string]>(fetcher, {
      queryKey: (id) => queryKey("notes", id),
      request: (id) => ({ path: `/notes/${id}`, responseSchema: NoteSchema }),
    });

    const options = notesQuery("1");
    // `queryFn` is always defined on the object `queryOptions()` returns for a non-skip-token query.
    const result = await options.queryFn?.({
      queryKey: options.queryKey,
      signal: new AbortController().signal,
      client: undefined as never,
      meta: undefined,
    });

    expect(result).toEqual({ id: "1", title: "Hello" });
    expect(fetcher.request).toHaveBeenCalledTimes(1);
    const [requestConfig] = (fetcher.request as ReturnType<typeof mock>).mock.calls[0] as [
      { path: string },
    ];
    expect(requestConfig.path).toBe("/notes/1");
  });

  test("honors a per-query staleTime override", () => {
    const fetcher = fakeFetcher({ id: "1", title: "Hello" });
    const notesQuery = defineQuery<z.infer<typeof NoteSchema>, [id: string]>(fetcher, {
      queryKey: (id) => queryKey("notes", id),
      request: (id) => ({ path: `/notes/${id}`, responseSchema: NoteSchema }),
      staleTime: 1000,
    });

    expect(notesQuery("1").staleTime).toBe(1000);
  });
});

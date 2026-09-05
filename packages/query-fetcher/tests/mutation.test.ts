import { describe, expect, mock, test } from "bun:test";
import { z } from "zod";

import type { Fetcher } from "../src/fetcher";
import { defineMutation } from "../src/mutation";

const NoteSchema = z.object({ id: z.string(), title: z.string() });

function fakeFetcher(result: unknown): Fetcher {
  return { request: mock(() => Promise.resolve(result)) as unknown as Fetcher["request"] };
}

describe("defineMutation", () => {
  test("carries the given mutationKey", () => {
    const fetcher = fakeFetcher({ id: "1", title: "Hello" });
    const createNote = defineMutation<z.infer<typeof NoteSchema>, { title: string }>(fetcher, {
      mutationKey: ["notes", "create"],
      request: (variables) => ({
        method: "POST",
        path: "/notes",
        body: variables,
        responseSchema: NoteSchema,
      }),
    });

    expect(createNote.mutationKey).toEqual(["notes", "create"]);
  });

  test("mutationFn calls the fetcher with the request built from the variables", async () => {
    const fetcher = fakeFetcher({ id: "1", title: "Hello" });
    const createNote = defineMutation<z.infer<typeof NoteSchema>, { title: string }>(fetcher, {
      mutationKey: ["notes", "create"],
      request: (variables) => ({
        method: "POST",
        path: "/notes",
        body: variables,
        responseSchema: NoteSchema,
      }),
    });

    const result = await createNote.mutationFn?.(
      { title: "Hello" },
      { client: undefined as never, meta: undefined },
    );

    expect(result).toEqual({ id: "1", title: "Hello" });
    expect(fetcher.request).toHaveBeenCalledTimes(1);
    const [requestConfig] = (fetcher.request as ReturnType<typeof mock>).mock.calls[0] as [
      { method: string; path: string; body: unknown },
    ];
    expect(requestConfig).toMatchObject({
      method: "POST",
      path: "/notes",
      body: { title: "Hello" },
    });
  });
});

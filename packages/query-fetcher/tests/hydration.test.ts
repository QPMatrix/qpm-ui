import { describe, expect, test } from "bun:test";
import { QueryClient } from "@tanstack/react-query";

import { dehydrateState, prefetchQuery } from "../src/hydration";

describe("prefetchQuery", () => {
  test("populates the client's cache for that query key", async () => {
    const client = new QueryClient();

    await prefetchQuery(client, {
      queryKey: ["notes", "1"],
      queryFn: () => Promise.resolve({ id: "1", title: "Hello" }),
    });

    expect(client.getQueryData<{ id: string; title: string }>(["notes", "1"])).toEqual({
      id: "1",
      title: "Hello",
    });
  });
});

describe("dehydrateState", () => {
  test("serializes prefetched queries into a HydrationBoundary-ready state", async () => {
    const client = new QueryClient();
    await prefetchQuery(client, {
      queryKey: ["notes", "1"],
      queryFn: () => Promise.resolve({ id: "1", title: "Hello" }),
    });

    const state = dehydrateState(client);

    expect(state.queries).toHaveLength(1);
    expect(state.queries[0]?.queryKey).toEqual(["notes", "1"]);
    expect(state.queries[0]?.state.data).toEqual({ id: "1", title: "Hello" });
  });

  test("captures multiple prefetched queries from the same client", async () => {
    const client = new QueryClient();
    await Promise.all([
      prefetchQuery(client, {
        queryKey: ["notes", "1"],
        queryFn: () => Promise.resolve({ id: "1" }),
      }),
      prefetchQuery(client, {
        queryKey: ["notes", "2"],
        queryFn: () => Promise.resolve({ id: "2" }),
      }),
    ]);

    const state = dehydrateState(client);

    expect(state.queries).toHaveLength(2);
  });
});

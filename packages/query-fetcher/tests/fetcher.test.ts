import { describe, expect, mock, test } from "bun:test";
import { z } from "zod";

import { createFetcher } from "../src/fetcher";

const NoteSchema = z.object({ id: z.string(), title: z.string() });

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });
}

/** Typed helper so `fetchImpl.mock.calls` infers `[URL, RequestInit]` instead of `[]`. */
function mockFetch(
  handler: (url: string | URL | Request, init?: RequestInit) => Promise<Response>,
) {
  return mock(handler);
}

/**
 * Awaits `promise` and returns the rejection reason. bun-types' `expect(...).rejects`
 * matcher chain is typed as synchronous (`Matchers<unknown>`), which trips
 * `@typescript-eslint/await-thenable` when `await`ed directly — this sidesteps that typing
 * gap entirely instead of suppressing the rule.
 */
async function captureRejection(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error("Expected promise to reject, but it resolved");
}

describe("createFetcher — success paths", () => {
  test("resolves a GET request with a validated, typed response", async () => {
    const fetchImpl = mockFetch(() => Promise.resolve(jsonResponse({ id: "1", title: "Hello" })));
    const fetcher = createFetcher({
      baseUrl: "https://api.qpmatrix.test",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const note = await fetcher.request({ path: "/notes/1", responseSchema: NoteSchema });

    expect(note).toEqual({ id: "1", title: "Hello" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as [URL, RequestInit];
    expect(url.toString()).toBe("https://api.qpmatrix.test/notes/1");
    expect(init.method).toBe("GET");
  });

  test("joins baseUrl and path regardless of leading/trailing slashes", async () => {
    const fetchImpl = mockFetch(() => Promise.resolve(jsonResponse({ id: "1", title: "Hello" })));
    const fetcher = createFetcher({
      baseUrl: "https://api.qpmatrix.test/v1/",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await fetcher.request({ path: "/notes/1", responseSchema: NoteSchema });

    const [url] = fetchImpl.mock.calls[0] as [URL];
    expect(url.toString()).toBe("https://api.qpmatrix.test/v1/notes/1");
  });

  test("serializes defined query params and skips undefined ones", async () => {
    const fetchImpl = mockFetch(() => Promise.resolve(jsonResponse({ id: "1", title: "Hello" })));
    const fetcher = createFetcher({
      baseUrl: "https://api.qpmatrix.test",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await fetcher.request({
      path: "/notes",
      params: { limit: 10, cursor: undefined, archived: false },
      responseSchema: NoteSchema,
    });

    const [url] = fetchImpl.mock.calls[0] as [URL];
    expect(url.searchParams.get("limit")).toBe("10");
    expect(url.searchParams.get("archived")).toBe("false");
    expect(url.searchParams.has("cursor")).toBe(false);
  });

  test("sets JSON Accept/Content-Type defaults and serializes a validated body", async () => {
    const fetchImpl = mockFetch(() => Promise.resolve(jsonResponse({ id: "1", title: "Hi" })));
    const fetcher = createFetcher({
      baseUrl: "https://api.qpmatrix.test",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const bodySchema = z.object({ title: z.string() });

    await fetcher.request({
      method: "POST",
      path: "/notes",
      body: { title: "Hi" },
      bodySchema,
      responseSchema: NoteSchema,
    });

    const [, init] = fetchImpl.mock.calls[0] as [URL, RequestInit];
    const headers = new Headers(init.headers);
    expect(headers.get("Accept")).toBe("application/json");
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(init.body).toBe(JSON.stringify({ title: "Hi" }));
  });

  test("treats a 204 response as an empty, schema-validated result", async () => {
    const fetchImpl = mockFetch(() => Promise.resolve(new Response(null, { status: 204 })));
    const fetcher = createFetcher({
      baseUrl: "https://api.qpmatrix.test",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    // `responseSchema: z.undefined()` types the resolved value as `undefined` itself, so
    // there is nothing further to assert beyond "this resolved instead of throwing" — a 204
    // with a schema that doesn't accept `undefined` would have thrown INVALID_RESPONSE.
    await fetcher.request({ method: "DELETE", path: "/notes/1", responseSchema: z.undefined() });
  });
});

describe("createFetcher — validation failures", () => {
  test("rejects an invalid request body before calling fetch", async () => {
    const fetchImpl = mockFetch(() => Promise.resolve(jsonResponse({ id: "1", title: "Hi" })));
    const fetcher = createFetcher({
      baseUrl: "https://api.qpmatrix.test",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const bodySchema = z.object({ title: z.string() });

    const error = await captureRejection(
      fetcher.request({
        method: "POST",
        path: "/notes",
        body: { title: 42 } as unknown as { title: string },
        bodySchema,
        responseSchema: NoteSchema,
      }),
    );

    expect(error).toMatchObject({ code: "INVALID_REQUEST_BODY" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  test("rejects a response that fails the response schema", async () => {
    const fetchImpl = mockFetch(() => Promise.resolve(jsonResponse({ id: "1" })));
    const fetcher = createFetcher({
      baseUrl: "https://api.qpmatrix.test",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const error = await captureRejection(
      fetcher.request({ path: "/notes/1", responseSchema: NoteSchema }),
    );

    expect(error).toMatchObject({ code: "INVALID_RESPONSE", status: 200 });
  });
});

describe("createFetcher — error envelope handling", () => {
  test("throws QueryFetcherError built from the standard error envelope", async () => {
    const fetchImpl = mockFetch(() =>
      Promise.resolve(
        jsonResponse(
          { error: { code: "NOT_FOUND", message: "note not found", requestId: "req_1" } },
          { status: 404 },
        ),
      ),
    );
    const fetcher = createFetcher({
      baseUrl: "https://api.qpmatrix.test",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const error = await captureRejection(
      fetcher.request({ path: "/notes/1", responseSchema: NoteSchema }),
    );

    expect(error).toMatchObject({
      code: "NOT_FOUND",
      status: 404,
      message: "note not found",
      requestId: "req_1",
    });
  });

  test("falls back to UNKNOWN_ERROR for a non-envelope error body", async () => {
    const fetchImpl = mockFetch(() =>
      Promise.resolve(
        new Response("Internal Server Error", { status: 500, statusText: "Internal Server Error" }),
      ),
    );
    const fetcher = createFetcher({
      baseUrl: "https://api.qpmatrix.test",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const error = await captureRejection(
      fetcher.request({ path: "/notes/1", responseSchema: NoteSchema }),
    );

    expect(error).toMatchObject({ code: "UNKNOWN_ERROR", status: 500 });
  });
});

describe("createFetcher — abort/timeout", () => {
  test("aborts the request once the configured timeout elapses", async () => {
    const fetchImpl = mockFetch(
      (_input: string | URL | Request, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Request timed out", "AbortError"));
          });
        }),
    );
    const fetcher = createFetcher({
      baseUrl: "https://api.qpmatrix.test",
      fetchImpl: fetchImpl as unknown as typeof fetch,
      timeoutMs: 5,
    });

    const error = await captureRejection(
      fetcher.request({ path: "/slow", responseSchema: NoteSchema }),
    );

    expect(error).toMatchObject({ code: "ABORTED" });
  });

  test("propagates a caller-provided AbortSignal that is already aborted", async () => {
    const fetchImpl = mockFetch(
      (_input: string | URL | Request, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          if (init?.signal?.aborted) {
            reject(new DOMException("Aborted", "AbortError"));
          }
        }),
    );
    const fetcher = createFetcher({
      baseUrl: "https://api.qpmatrix.test",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const controller = new AbortController();
    controller.abort();

    const error = await captureRejection(
      fetcher.request({ path: "/notes/1", responseSchema: NoteSchema, signal: controller.signal }),
    );

    expect(error).toMatchObject({ code: "ABORTED" });
  });

  test("wraps a raw fetch failure as a NETWORK_ERROR", async () => {
    const fetchImpl = mockFetch(() => Promise.reject(new TypeError("fetch failed")));
    const fetcher = createFetcher({
      baseUrl: "https://api.qpmatrix.test",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const error = await captureRejection(
      fetcher.request({ path: "/notes/1", responseSchema: NoteSchema }),
    );

    expect(error).toMatchObject({ code: "NETWORK_ERROR" });
  });
});

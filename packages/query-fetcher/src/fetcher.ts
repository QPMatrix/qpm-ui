import type { z } from "zod";

import { ErrorEnvelopeSchema, QueryFetcherError, QueryFetcherErrorCode } from "./errors";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type QueryParamValue = string | number | boolean | undefined;

export interface FetcherConfig {
  /** Origin (+ optional base path) every request path is resolved against, e.g. `"https://api.qpmatrix.tech"`. */
  baseUrl: string;
  /**
   * Headers merged into every request. Pass a function to re-resolve it per call — the
   * standard way to attach a fresh auth token, or forward request-scoped cookies from a
   * Next.js server component/route handler, without ever touching `fetch` directly.
   */
  defaultHeaders?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>);
  /** Default per-request timeout in ms. Omit (or `0`) to disable by default; overridable per call. */
  timeoutMs?: number;
  /**
   * Override for `fetch` — used by tests to inject a mock. Never call `fetch` directly in
   * app code; this is the one seam that exists for it, and only tests should use it.
   */
  fetchImpl?: typeof fetch;
}

export interface FetchRequestConfig<TResponse, TBody = undefined> {
  method?: HttpMethod;
  path: string;
  params?: Record<string, QueryParamValue>;
  body?: TBody;
  /** Validated before the request is sent. Only checked when `body` is provided. */
  bodySchema?: z.ZodType<TBody>;
  /** Validated against the parsed JSON response. The inferred `TResponse` comes from this schema. */
  responseSchema: z.ZodType<TResponse>;
  headers?: HeadersInit;
  signal?: AbortSignal;
  /** Overrides `FetcherConfig.timeoutMs` for this call only. */
  timeoutMs?: number;
}

export interface Fetcher {
  // `this: void` documents that `request` never reads `this` — it's a plain function held on
  // an object, safe to destructure/pass around, and it keeps `@typescript-eslint/unbound-method`
  // quiet for callers that do exactly that (e.g. tests asserting on `fetcher.request` directly).
  request<TResponse, TBody = undefined>(
    this: void,
    config: FetchRequestConfig<TResponse, TBody>,
  ): Promise<TResponse>;
}

const JSON_CONTENT_TYPE = "application/json";

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

/**
 * Creates the one typed HTTP client an app is allowed to hold. Wraps `fetch` with base-URL
 * resolution, zod-validated request/response bodies, the standard error-envelope handling
 * (docs/architecture.md Section 7), and merged abort/timeout support. Safe to call from
 * Server Components, Route Handlers, and Client Components alike — it never touches
 * `window` or any browser-only global.
 */
export function createFetcher(config: FetcherConfig): Fetcher {
  const fetchImpl = config.fetchImpl ?? fetch;
  const baseUrl = config.baseUrl.endsWith("/") ? config.baseUrl : `${config.baseUrl}/`;

  async function resolveDefaultHeaders(): Promise<HeadersInit> {
    if (typeof config.defaultHeaders === "function") {
      return config.defaultHeaders();
    }
    return config.defaultHeaders ?? {};
  }

  function buildUrl(path: string, params: Record<string, QueryParamValue> | undefined): URL {
    const relativePath = path.startsWith("/") ? path.slice(1) : path;
    const url = new URL(relativePath, baseUrl);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url;
  }

  async function buildHeaders(
    perRequest: HeadersInit | undefined,
    hasBody: boolean,
  ): Promise<Headers> {
    const headers = new Headers(await resolveDefaultHeaders());
    if (perRequest) {
      new Headers(perRequest).forEach((value, key) => {
        headers.set(key, value);
      });
    }
    if (!headers.has("Accept")) {
      headers.set("Accept", JSON_CONTENT_TYPE);
    }
    if (hasBody && !headers.has("Content-Type")) {
      headers.set("Content-Type", JSON_CONTENT_TYPE);
    }
    return headers;
  }

  /** Merges an optional caller `AbortSignal` with an optional timeout into one signal. */
  function mergeSignals(
    external: AbortSignal | undefined,
    timeoutMs: number | undefined,
  ): { signal: AbortSignal | null; cleanup: () => void } {
    if (!timeoutMs && !external) {
      return { signal: null, cleanup: () => undefined };
    }

    const controller = new AbortController();
    const cleanups: (() => void)[] = [];

    if (external) {
      if (external.aborted) {
        controller.abort(external.reason);
      } else {
        const onAbort = () => {
          controller.abort(external.reason);
        };
        external.addEventListener("abort", onAbort);
        cleanups.push(() => {
          external.removeEventListener("abort", onAbort);
        });
      }
    }

    if (timeoutMs && timeoutMs > 0) {
      const timer = setTimeout(() => {
        controller.abort(new DOMException("Request timed out", "TimeoutError"));
      }, timeoutMs);
      cleanups.push(() => {
        clearTimeout(timer);
      });
    }

    return {
      signal: controller.signal,
      cleanup: () => {
        for (const cleanupFn of cleanups) {
          cleanupFn();
        }
      },
    };
  }

  async function parseErrorResponse(response: Response): Promise<QueryFetcherError> {
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      return new QueryFetcherError(
        response.statusText || `Request failed with status ${response.status}`,
        {
          status: response.status,
          code: QueryFetcherErrorCode.UnknownError,
        },
      );
    }

    const envelope = ErrorEnvelopeSchema.safeParse(payload);
    if (envelope.success) {
      const { code, message, requestId } = envelope.data.error;
      return new QueryFetcherError(message, {
        status: response.status,
        code,
        ...(requestId !== undefined ? { requestId } : {}),
      });
    }

    return new QueryFetcherError(
      response.statusText || `Request failed with status ${response.status}`,
      {
        status: response.status,
        code: QueryFetcherErrorCode.UnknownError,
        cause: payload,
      },
    );
  }

  async function request<TResponse, TBody = undefined>(
    requestConfig: FetchRequestConfig<TResponse, TBody>,
  ): Promise<TResponse> {
    const method = requestConfig.method ?? "GET";
    const url = buildUrl(requestConfig.path, requestConfig.params);

    let bodyPayload: TBody | undefined = requestConfig.body;
    if (requestConfig.bodySchema && requestConfig.body !== undefined) {
      const parsedBody = requestConfig.bodySchema.safeParse(requestConfig.body);
      if (!parsedBody.success) {
        throw new QueryFetcherError("Request body failed validation", {
          status: 0,
          code: QueryFetcherErrorCode.InvalidRequestBody,
          cause: parsedBody.error,
        });
      }
      bodyPayload = parsedBody.data;
    }

    const hasBody = bodyPayload !== undefined && method !== "GET";
    const headers = await buildHeaders(requestConfig.headers, hasBody);
    const timeoutMs = requestConfig.timeoutMs ?? config.timeoutMs;
    const { signal, cleanup } = mergeSignals(requestConfig.signal, timeoutMs);

    let response: Response;
    try {
      response = await fetchImpl(url, {
        method,
        headers,
        body: hasBody ? JSON.stringify(bodyPayload) : null,
        signal,
      });
    } catch (cause) {
      if (isAbortError(cause)) {
        throw new QueryFetcherError("Request was aborted", {
          status: 0,
          code: QueryFetcherErrorCode.Aborted,
          cause,
        });
      }
      throw new QueryFetcherError("Network request failed", {
        status: 0,
        code: QueryFetcherErrorCode.NetworkError,
        cause,
      });
    } finally {
      cleanup();
    }

    if (!response.ok) {
      throw await parseErrorResponse(response);
    }

    if (response.status === 204) {
      const parsedEmpty = requestConfig.responseSchema.safeParse(undefined);
      if (!parsedEmpty.success) {
        throw new QueryFetcherError("Response failed schema validation", {
          status: response.status,
          code: QueryFetcherErrorCode.InvalidResponse,
          cause: parsedEmpty.error,
        });
      }
      return parsedEmpty.data;
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch (cause) {
      throw new QueryFetcherError("Response body was not valid JSON", {
        status: response.status,
        code: QueryFetcherErrorCode.InvalidResponse,
        cause,
      });
    }

    const parsed = requestConfig.responseSchema.safeParse(payload);
    if (!parsed.success) {
      throw new QueryFetcherError("Response failed schema validation", {
        status: response.status,
        code: QueryFetcherErrorCode.InvalidResponse,
        cause: parsed.error,
      });
    }

    return parsed.data;
  }

  return { request };
}

import { z } from "zod";

/**
 * The standard error envelope every QPMatrix API response uses on failure,
 * per docs/architecture.md Section 7 ("Error and Response Conventions"):
 *
 * ```json
 * { "error": { "code": "NOT_FOUND", "message": "note not found", "requestId": "req_01hxyz..." } }
 * ```
 *
 * This is the *only* shape the fetcher trusts for a structured server error;
 * anything else falls back to a best-effort message.
 */
export const ErrorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string().optional(),
  }),
});

export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;

/** Stable machine-readable codes this package raises itself (not from the server envelope). */
export const QueryFetcherErrorCode = {
  /** The response body did not match the envelope shape and had no other error info to use. */
  UnknownError: "UNKNOWN_ERROR",
  /** The response body failed `responseSchema.safeParse`. */
  InvalidResponse: "INVALID_RESPONSE",
  /** The request `body` failed `bodySchema.safeParse` before being sent. */
  InvalidRequestBody: "INVALID_REQUEST_BODY",
  /** The request was aborted by an explicit `AbortSignal` or the configured timeout. */
  Aborted: "ABORTED",
  /** `fetch` itself threw (network failure, DNS, TLS, etc.) before a response was received. */
  NetworkError: "NETWORK_ERROR",
} as const;

export type QueryFetcherErrorCode =
  (typeof QueryFetcherErrorCode)[keyof typeof QueryFetcherErrorCode];

export interface QueryFetcherErrorOptions {
  /** HTTP status code, or `0` when no response was ever received (network/abort failures). */
  status: number;
  code: string;
  requestId?: string;
  cause?: unknown;
}

/**
 * Thrown by every `Fetcher` for both transport failures (network, abort, timeout) and
 * validation failures (bad request body, bad response body), as well as server-reported
 * errors that match {@link ErrorEnvelopeSchema}. Callers should check `.code` for branching
 * logic — it is the same stable string the API returns, or one of {@link QueryFetcherErrorCode}
 * for client-side failures.
 */
export class QueryFetcherError extends Error {
  readonly status: number;
  readonly code: string;
  // `declare` suppresses TS's implicit `this.requestId = undefined` field initializer (the
  // class-fields spec runs that before the constructor body), so the property is genuinely
  // absent on the instance unless the conditional assignment below actually runs.
  declare readonly requestId?: string;

  constructor(message: string, options: QueryFetcherErrorOptions) {
    super(message, options.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = "QueryFetcherError";
    this.status = options.status;
    this.code = options.code;
    if (options.requestId !== undefined) {
      this.requestId = options.requestId;
    }
  }
}

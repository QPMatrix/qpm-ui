import { describe, expect, test } from "bun:test";

import { ErrorEnvelopeSchema, QueryFetcherError } from "../src/errors";

describe("ErrorEnvelopeSchema", () => {
  test("accepts the standard error envelope shape", () => {
    const result = ErrorEnvelopeSchema.safeParse({
      error: { code: "NOT_FOUND", message: "note not found", requestId: "req_01hxyz" },
    });
    expect(result.success).toBe(true);
  });

  test("accepts a missing requestId", () => {
    const result = ErrorEnvelopeSchema.safeParse({
      error: { code: "NOT_FOUND", message: "note not found" },
    });
    expect(result.success).toBe(true);
  });

  test("rejects a payload with no error key", () => {
    const result = ErrorEnvelopeSchema.safeParse({ message: "oops" });
    expect(result.success).toBe(false);
  });
});

describe("QueryFetcherError", () => {
  test("carries status, code, and message", () => {
    const error = new QueryFetcherError("note not found", { status: 404, code: "NOT_FOUND" });
    expect(error.status).toBe(404);
    expect(error.code).toBe("NOT_FOUND");
    expect(error.message).toBe("note not found");
    expect(error.name).toBe("QueryFetcherError");
    expect(error).toBeInstanceOf(Error);
  });

  test("omits requestId entirely when not provided", () => {
    const error = new QueryFetcherError("boom", { status: 500, code: "UNKNOWN_ERROR" });
    expect(error.requestId).toBeUndefined();
    expect("requestId" in error).toBe(false);
  });

  test("carries requestId when provided", () => {
    const error = new QueryFetcherError("boom", {
      status: 500,
      code: "UNKNOWN_ERROR",
      requestId: "req_1",
    });
    expect(error.requestId).toBe("req_1");
  });
});

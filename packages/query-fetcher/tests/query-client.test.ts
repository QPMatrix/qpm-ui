import { afterEach, describe, expect, test } from "bun:test";
import { environmentManager, QueryClient } from "@tanstack/react-query";

import {
  __resetBrowserQueryClientForTests,
  ensureQueryClient,
  getQueryClient,
} from "../src/query-client";

// `environmentManager.setIsServer` is the supported override hook for the same check
// `getQueryClient` relies on internally (`environmentManager.isServer()`), so tests can
// exercise both branches deterministically instead of faking `globalThis.window`.
const defaultIsServer = () => typeof window === "undefined";

afterEach(() => {
  environmentManager.setIsServer(defaultIsServer);
  __resetBrowserQueryClientForTests();
});

describe("getQueryClient — server branch", () => {
  test("returns a fresh QueryClient on every call", () => {
    environmentManager.setIsServer(() => true);

    const first = getQueryClient();
    const second = getQueryClient();

    expect(first).toBeInstanceOf(QueryClient);
    expect(second).toBeInstanceOf(QueryClient);
    expect(first).not.toBe(second);
  });
});

describe("getQueryClient — browser branch", () => {
  test("returns the same singleton across calls", () => {
    environmentManager.setIsServer(() => false);

    const first = getQueryClient();
    const second = getQueryClient();

    expect(first).toBe(second);
  });

  test("ensureQueryClient is the same function as getQueryClient", () => {
    expect(ensureQueryClient).toBe(getQueryClient);
  });
});

describe("getQueryClient — default cache options", () => {
  test("applies the package's default staleTime", () => {
    environmentManager.setIsServer(() => true);
    const client = getQueryClient();
    expect(client.getDefaultOptions().queries?.staleTime).toBe(30 * 1000);
  });

  test("accepts a staleTime override", () => {
    environmentManager.setIsServer(() => true);
    const client = getQueryClient({ staleTime: 5000 });
    expect(client.getDefaultOptions().queries?.staleTime).toBe(5000);
  });
});

# @qpmtx/query-fetcher

## 0.3.0

### Minor Changes

- Remade in qpm-ui (QPMSEC-433). Ported verbatim from
  `qpmatrix-packages@c498f95` (`packages/query-fetcher`, 0.2.1) into
  this package's own public repo — same `createFetcher`, zod-validated
  request/response envelope, typed query keys/`defineQuery`/
  `defineMutation`, and the Next.js App Router SSR hydration helpers.
  No behaviour changed; only the repo, toolchain (oxlint replaces
  eslint), and version numbering moved.

## 0.2.1 (qpmatrix-packages)

### Patch Changes

- 7f7144f: Publish compiled `dist/` + `.d.ts` output instead of raw TypeScript source.

## 0.2.0 (qpmatrix-packages)

### Minor Changes

- ea18104: Initial release of the typed API client (v0.1.0): `createFetcher` wraps
  `fetch` with base-URL resolution, zod-validated request/response bodies,
  the standard error envelope (`{ error: { code, message, requestId? } }`),
  JSON defaults, and merged abort/timeout support. A TanStack Query
  integration layer adds typed query keys (`queryKey`, `defineQuery`),
  typed mutations (`defineMutation`), and Next.js App Router SSR support.

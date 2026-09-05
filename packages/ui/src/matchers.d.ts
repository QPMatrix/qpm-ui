import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

// Declaration merging (per Bun's own documented pattern for jest-dom +
// bun:test, bun.com/docs/test/dom.md) requires an `interface` with only an
// `extends` clause and no members of its own — that's what makes it a
// *merge* into bun:test's existing `Matchers`/`AsymmetricMatchers`
// interfaces rather than a fresh, unrelated declaration.
declare module "bun:test" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- declaration merging, see comment above
  interface Matchers<T> extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- declaration merging, see comment above
  interface AsymmetricMatchers extends TestingLibraryMatchers<unknown, unknown> {}
}

# qpm-ui

The QPMatrix UI monorepo: `@qpmtx/ui` (the shadcn/Base UI-source
component registry) and `@qpmtx/tokens` (the OKLCH design tokens it's
built on), plus the shared `@qpmtx/typescript-config` /
`@qpmtx/prettier-config` / `@qpmtx/oxlint-config` tooling packages
every one of them builds against. Public, Bun-only, oxlint-linted —
see [`INSTRUCTIONS.md`](./INSTRUCTIONS.md)
for the full governing-skills roster (`ts-craft`, `docs-craft`,
`repo-gates-and-hooks`, `release-and-publish`, and the estate base set).

## Install (no token required)

Every consumer-facing package publishes to **npmjs.org, public, under the
`@qpmtx` scope** (owner decision, 2026-09-05) — the default public
registry, so there's no `.npmrc` to add and no token to configure:

```sh
bun add @qpmtx/ui @qpmtx/tokens
```

(A monorepo-root git install — `bun add github:QPMatrix/qpm-ui#<tag>` —
does **not** yield these as separately importable packages; the root
`package.json` is `"private": true` and ships nothing itself. Always
install the individual `@qpmtx/*` packages by name, from the registry
above.)

**Publishing is not live yet — gated on OWNER-REQUIRED item 44.** The
`release` workflow (`.github/workflows/release.yml`) only runs on a
manual dispatch or a `v*` tag, and only when the `NPM_TOKEN` secret
exists; neither the npmjs.org `@qpmtx` org nor that secret has been
created yet, so no version of any package in this repo is on the
registry until the owner does both. Until then, consume this repo from
a worktree/checkout directly (`bun install` at the repo root, then
reference `packages/<name>` by path) rather than the install line above.

See each package's own README for its full API:
[`packages/ui`](./packages/ui/README.md),
[`packages/tokens`](./packages/tokens/README.md).

## Quickstart

```sh
git clone https://github.com/QPMatrix/qpm-ui.git && cd qpm-ui
git config core.hooksPath .githooks   # activates the pre-commit gate
bun install
./check                                # fmt, lint, typecheck, build, test
```

## Docs

- [`docs/lint.md`](./docs/lint.md) — what `@qpmtx/oxlint-config` covers
  from the old `eslint-config`/`eslint-plugin-architecture` pair, and the
  three rules that have no oxlint equivalent yet (named as GAPS, not
  silently dropped).

The gate is `./check`; the pre-commit hook and CI run exactly it
(`repo-gates-and-hooks` parity rule). `./check` fetches the pinned
qp-skills and qpsb-agents caches (`scripts/qp-skills-fetch.sh`,
`scripts/qp-agents-fetch.sh`) before running `instructions.py check`
(`repo-instructions` skill) — read [`INSTRUCTIONS.md`](./INSTRUCTIONS.md)
for what this repo is, its governing ADRs, and its mounted skills/agents.

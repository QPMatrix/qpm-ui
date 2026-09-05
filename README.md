# qpm-ui

The QPMatrix UI monorepo: `@qpmatrix/ui` (the shadcn/Base UI-source
component registry), `@qpmatrix/tokens` (the OKLCH design tokens it's
built on), `@qpmatrix/query-fetcher` (the typed TanStack Query client),
and the shared `@qpmatrix/typescript-config` / `@qpmatrix/prettier-config`
/ `@qpmatrix/oxlint-config` tooling packages every one of them builds
against. Public, Bun-only, oxlint-linted — see [`INSTRUCTIONS.md`](./INSTRUCTIONS.md)
for the full governing-skills roster (`ts-craft`, `docs-craft`,
`repo-gates-and-hooks`, `release-and-publish`, and the estate base set).

## Install (no token required)

Every package here is distributed git-native — pin a repo tag with Bun,
no npm, no registry credential:

```sh
bun add github:QPMatrix/qpm-ui#v1.1.0
```

That installs the whole workspace tarball; a consumer that only wants one
package still adds the same tag and imports only what it needs (Bun
resolves `packages/*` from the workspace root). See each package's own
README for its install line and API: [`packages/ui`](./packages/ui/README.md),
[`packages/tokens`](./packages/tokens/README.md),
[`packages/query-fetcher`](./packages/query-fetcher/README.md).

## Quickstart

```sh
git clone https://github.com/QPMatrix/qpm-ui.git && cd qpm-ui
git config core.hooksPath .githooks   # activates the pre-commit gate
bun install
./check                                # fmt, lint, typecheck, build, test
```

## Docs

- [`docs/lint.md`](./docs/lint.md) — what `@qpmatrix/oxlint-config` covers
  from the old `eslint-config`/`eslint-plugin-architecture` pair, and the
  two rules that have no oxlint equivalent yet (named as GAPS, not
  silently dropped).

The gate is `./check`; the pre-commit hook and CI run exactly it
(`repo-gates-and-hooks` parity rule). `./check` fetches the pinned
qp-skills and qpsb-agents caches (`scripts/qp-skills-fetch.sh`,
`scripts/qp-agents-fetch.sh`) before running `instructions.py check`
(`repo-instructions` skill) — read [`INSTRUCTIONS.md`](./INSTRUCTIONS.md)
for what this repo is, its governing ADRs, and its mounted skills/agents.

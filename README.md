# qpm-ui

QPMatrix UI monorepo: @qpmatrix/ui, tokens, query-fetcher and the shared TypeScript configs (public packages, Bun, oxlint)

## Setup (every clone)

```sh
git config core.hooksPath .githooks
```

The gate is `./check`; the pre-commit hook and CI run exactly it
(repo-gates-and-hooks parity rule). `./check` fetches the pinned
qp-skills and qpsb-agents caches (scripts/qp-skills-fetch.sh,
scripts/qp-agents-fetch.sh) before running `instructions.py check`
(repo-instructions skill) — read `INSTRUCTIONS.md` for what this repo
is, its governing ADRs, and its mounted skills/agents. Extend `check`
as content arrives.

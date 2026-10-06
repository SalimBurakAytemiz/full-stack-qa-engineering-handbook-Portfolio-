# Release Engineering Lab

Two independent, real, hand-rolled release-engineering checks — no
fixtures standing in for the real artifact under test:

1. **Release versioning & changelog integrity** (`lib/semver.js` +
   `lib/changelog-check.js`): a real semver 2.0.0 parser/comparator
   (not the npm `semver` package) and a real Markdown-heading
   structural checker, run against this repository's own real
   `CHANGELOG.md` and the 6 real workspace `package.json` files.
2. **Canary rollout & automatic rollback** (`lib/rollout-manager.js`):
   a real staged-traffic rollout state machine that calls a real
   (injectable) health-check function before every stage advance and
   automatically rolls back to 0% traffic the instant one fails.

## Why hand-rolled, not a dependency

Parsing semver strings and Markdown `##`/`###` headings correctly is a
small, fully-specified, independently-testable piece of logic — the
same reasoning this repository already applied to i18n-testing
(Node's own `Intl`) and modern-protocols (Node's own `http`). No
`semver`, `remark`, or deployment-orchestration package is added.

## Scope boundary

- `lib/rollout-manager.js` is a hand-rolled in-process state machine —
  not a real traffic-shifting proxy, load balancer, or Kubernetes
  rollout controller. No real network traffic is ever shifted.
- `lib/changelog-check.js` enforces this repository's own real
  CHANGELOG.md's structure (Keep-a-Changelog-style `### Added` /
  `### Fixed` / etc. categories, this repo's own `### Notes` addition,
  and version-ordering via the real semver comparator) — it is not a
  general-purpose Markdown linter.
- `lib/semver.js` implements semver.org 2.0.0 precedence rules
  (clauses 10 and 11) and the clause 4 pre-1.0 instability signal. It
  does not implement npm's range syntax (`^`, `~`, `>=`, etc.).

## Running it

```bash
npm run release-eng:test:unit --workspace automation-labs   # 21 unit tests
npm run release-eng:test --workspace automation-labs        # real aggregate run against this repo's own files
```

See `EXECUTION.md` for the actual observed output.

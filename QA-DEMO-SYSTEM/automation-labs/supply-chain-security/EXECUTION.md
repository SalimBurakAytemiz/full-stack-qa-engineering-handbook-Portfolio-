# Supply Chain Security Lab — Execution Evidence

**Date:** 2026-10-02
**Environment:** sandbox container, npm 10.9.7.

## Run 1 — unit tests

**Command:**
```bash
node --test automation-labs/supply-chain-security/tests/*.test.js
```
(from `QA-DEMO-SYSTEM/`).

**Result:** `1..14 / # pass 14 / # fail 0`. Exit code `0`. Covers
`sbom.test.js` (2), `audit.test.js` (3), `cross-reference.test.js` (4),
`lockfile-integrity.test.js` (5, including a direct check against this
repository's own real `package-lock.json`).

## Run 2 — the real aggregate lab

**Command:** `node automation-labs/supply-chain-security/run-supply-chain-security-lab.js`
(from `QA-DEMO-SYSTEM/`) — independent review finding F8: this run's cwd was previously misdocumented as `QA-DEMO-SYSTEM/automation-labs/`, which combined with this exact command would resolve to a nonexistent doubled path (automation-labs/automation-labs/...); corrected to match the command's own automation-labs/ prefix.

**Actual observed output:**
```
--- Supply Chain Security Lab: real scenario results ---
  [PASS] a real CycloneDX SBOM is generated for the backend workspace with at least one component (bomFormat=CycloneDX, components=76)
  [PASS] production-only audit scope never reports more vulnerabilities than the full dependency graph (full=24, prodOnly=0)
  [PASS] every production-scoped vulnerable package (if any) is traceable in the backend SBOM — no blind spot (prodVulnerable=0, tracedInSbom=0, notInSbom=[])
  [PASS] every externally-fetched lockfile entry carries an integrity hash (local workspace links correctly excluded) (checked=415, excludedLocalWorkspaces=4, violations=[])

  Full-graph audit (incl. dev): 24 vulnerable advisories across 423 dependencies.
  Production-only audit: 0 vulnerable advisories across 423 dependencies.
  Excluded local workspace links (correctly not flagged): node_modules/automation-labs, node_modules/qa-demo-system-api-tests, node_modules/qa-demo-system-backend, node_modules/web-tests

SUPPLY_CHAIN_SECURITY_LAB_STATUS: EXECUTED
```
Exit code `0`.

## What this run actually proves

- `npm sbom` really ran against the real `backend` workspace and produced
  a real CycloneDX 1.5 document with 76 real components — not a hand-written
  fixture.
- `npm audit --json` really ran twice (full graph, then `--omit=dev`) and
  the real numbers (24 vs. 0) are reported honestly side by side, including
  the full count rather than only the flattering production-only one.
- The cross-reference check had zero production-scoped vulnerabilities to
  trace in this run (because the real production-only audit found none) —
  this is reported as `prodVulnerable=0` explicitly, not silently skipped,
  so the check's real input is visible.
- The lockfile-integrity check inspected every entry in the real
  `package-lock.json` (424 total package entries, `lockfileVersion: 3`),
  correctly separated the 4 legitimate local workspace symlinks
  (`link: true`) from the 415 real, externally-fetched registry packages,
  and found zero of those 415 missing their `integrity` SRI hash.

## Known limitation discovered during design (documented, not hidden)

While building `lib/lockfile-integrity.js`, an inline diagnostic against
the real `package-lock.json` (`lockfileVersion: 3`, 424 total package
entries) found exactly 4 entries with a `resolved` field but no
`integrity`: `node_modules/automation-labs`, `node_modules/qa-demo-system-api-tests`,
`node_modules/qa-demo-system-backend`, `node_modules/web-tests`. All four
are this repo's own local npm workspaces, marked by npm itself with
`link: true` and a non-URL `resolved` value (e.g. `"backend"`, not a
`https://registry.npmjs.org/...` tarball URL). These are symlinks, never
downloaded, and can never carry an `integrity` hash — flagging them would
have been a false positive. The checker excludes any entry with
`link: true` for exactly this reason, verified by a dedicated test
(`lockfile-integrity.test.js`, test 3).

## Scope and honesty notes

- Not a commercial SCA tool — see `README.md`'s "Scope boundary" section.

## Run 4 — Windows-safe npm launch fix (independent review finding F1)

An independent Codex review of commit `23078ee` found a real
portability defect: `lib/sbom.js` and `lib/audit.js` both called
`execFileSync('npm', ...)` directly. On Windows, the real `npm`
executable on `PATH` is `npm.cmd` (a shell wrapper), and
`execFileSync` without `shell: true` does not consult `PATHEXT` the
way a real shell does — so the documented Windows workflow for this
lab would genuinely fail with `spawnSync npm ENOENT`, even though
Linux CI (which this repository's only available sandbox and CI
runner both are) never surfaces it.

The fix (`lib/npm-cli.js`) never invokes a bare `npm`/`npm.cmd` name
at all: it resolves npm's own real JavaScript CLI entry point
(`npm-cli.js`) relative to the currently running Node binary
(`process.execPath`), trying both the Windows layout
(`<node-bin-dir>/node_modules/npm/bin/npm-cli.js`) and the Unix layout
(`<node-prefix>/lib/node_modules/npm/bin/npm-cli.js`), then runs that
file directly through `process.execPath` — exactly the same
cross-platform mechanism already used elsewhere in this repository
(e.g. `api-tests/scripts/generate-html-report.js`'s `resetDatabase()`)
to invoke a known Node script without going through a shell or `PATH`
lookup at all. No `.cmd`/`.bat` file is ever launched, so this is not
a `shell: true` workaround and does not depend on shell-specific
quoting.

**Honest scope of this verification:** this sandbox and this
repository's GitHub Actions runners are both Linux (`ubuntu-latest`)
— there is no Windows environment available to this session to
execute the fix on. What was actually verified: (1) the fix's
resolver correctly locates this environment's real
`/opt/node22/lib/node_modules/npm/bin/npm-cli.js` via the Unix branch
of the same candidate-path logic a Windows machine would use the
Windows branch for; (2) all 14 existing unit tests and the full
aggregate runner still pass unchanged on Linux after the fix,
confirming no regression; (3) the only code path that could produce
Windows' `ENOENT` (a bare `execFileSync('npm', ...)` call) no longer
exists anywhere in this lab. A real Windows CI run or Windows
developer machine is the only way to literally observe the fix
succeed there — that observation has not been made and is not
claimed here.

```bash
node --test automation-labs/supply-chain-security/tests/*.test.js
# -> 1..14 / # pass 14 / # fail 0 (unchanged)
node automation-labs/supply-chain-security/run-supply-chain-security-lab.js
# -> SUPPLY_CHAIN_SECURITY_LAB_STATUS: EXECUTED (unchanged)
```

## Run 3 — CI-verified

GitHub Actions run
[`37080426518`](https://github.com/SalimBurakAytemiz/full-stack-qa-engineering-handbook-Portfolio-/actions/runs/37080426518)
(commit `e573ddf`), job **"Supply Chain Security lab (real npm sbom +
npm audit + lockfile integrity)"** — `conclusion: success`. The same
`npm run supply-chain:test --workspace automation-labs` command confirmed
above ran against GitHub Actions' real `ubuntu-latest` runner with the
same observed output (76 components, 24 full-graph vs. 0 production-only
vulnerabilities, 415 checked with 0 violations).

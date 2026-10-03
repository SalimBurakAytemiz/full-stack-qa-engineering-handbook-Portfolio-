# Supply Chain Security Lab

Real tests of three supply-chain-security QA concerns against this actual
repository: SBOM generation, vulnerability auditing, and lockfile integrity.
Every number this lab prints is observed from a real command run in this
environment, not a canned or assumed result.

## What this lab actually does

- `lib/sbom.js` shells out to npm's own **built-in** `npm sbom
  --sbom-format cyclonedx --workspace backend` command (no SBOM-generation
  dependency added) and parses the real CycloneDX JSON document it prints.
- `lib/audit.js` shells out to npm's own `npm audit --json`, once for the
  full dependency graph and once with `--omit=dev` for the production-only
  graph. `npm audit` exits non-zero when it finds vulnerabilities — that is
  a normal result, not a failure, so a non-zero exit with valid JSON on
  stdout is treated as a successful audit run.
- `lib/cross-reference.js` checks that every package the production-only
  audit flags as vulnerable is actually traceable as a component in the
  backend SBOM — the real question a supply-chain review needs answered:
  "can I see everything that's vulnerable?"
- `lib/lockfile-integrity.js` checks the real `package-lock.json` for
  `integrity` SRI hashes on every entry resolved from a real external
  registry URL. Local workspace packages (this repo's own `backend`,
  `api-tests`, `web-tests`, `automation-labs`, which npm marks with
  `link: true`) are symlinked, never downloaded, and correctly excluded —
  they are not a supply-chain gap.

## Real observed numbers (this repository, this run)

- Backend workspace SBOM: **76 real components**.
- Full dependency graph audit (including devDependencies): **24 vulnerable
  advisories** across 423 dependencies — these are pre-existing, disclosed,
  dev-tooling-only advisories (see the Dependency note below).
- Production-only audit (`--omit=dev`): **0 vulnerable advisories**.
- Lockfile integrity: **415 real registry-resolved entries checked, 0
  violations**, with **4 local workspace links correctly excluded**
  (`node_modules/automation-labs`, `node_modules/qa-demo-system-api-tests`,
  `node_modules/qa-demo-system-backend`, `node_modules/web-tests`).

## Dependency note (full transparency)

The 24 full-graph advisories are all in devDependencies — mostly the
pre-existing `newman`/`postman` reporting chain plus `testcontainers`'s
`dockerode`/`undici` chain added in Milestone 2.4. None of them reach the
production dependency graph; `npm audit --omit=dev` confirms 0. This lab
does not hide that number — it reports both the full and production-scoped
counts explicitly so the real picture is visible.

## Scope boundary

This is not a commercial SCA tool (Snyk, Dependabot, Sonatype). It does
not check license compliance, does not resolve transitive version ranges
beyond what npm's own lockfile already resolved, and does not detect
typosquatting or malicious-package heuristics. What is real: the SBOM is a
genuine CycloneDX document from npm's own tooling, the audit is npm's own
real vulnerability database lookup, and the lockfile-integrity check reads
the actual lockfile this repository installs from.

## Run it

```bash
# from QA-DEMO-SYSTEM/automation-labs/
node supply-chain-security/run-supply-chain-security-lab.js
node --test supply-chain-security/tests/*.test.js
```

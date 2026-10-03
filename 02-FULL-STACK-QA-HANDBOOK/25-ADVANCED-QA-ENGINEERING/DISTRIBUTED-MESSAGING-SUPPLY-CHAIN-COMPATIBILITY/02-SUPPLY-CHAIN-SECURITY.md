# Supply Chain Security QA

## Why this matters for QA, not just security

A modern application's real attack surface includes every package its
build pulls in transitively — often hundreds of packages no one on the
team wrote or reviewed. Supply-chain security testing answers three
concrete, testable questions: **what is actually in this build** (an
SBOM), **which of it is known-vulnerable** (an audit), and **can every
installed package's downloaded content be verified against what was
promised** (lockfile integrity). None of these require a commercial SCA
tool to get real signal — this lab uses only npm's own built-in tooling.

## 1. SBOM — what is actually in this build

A Software Bill of Materials (SBOM) is a structured, machine-readable
inventory of every component in a build — the artifact a real
supply-chain review or compliance process actually consumes, not a
prose list. `lib/sbom.js` shells out to npm's own built-in
`npm sbom --sbom-format cyclonedx --workspace backend` and parses the
real CycloneDX 1.5 JSON document it produces — a real, observed run
against this repository's real `backend` workspace produced **76 real
components**, not a hand-written fixture.

## 2. Audit — which of it is known-vulnerable

`lib/audit.js` shells out to npm's own `npm audit --json`, which queries
npm's real vulnerability database against the real resolved dependency
tree. A key, easy-to-miss detail: `npm audit` **exits non-zero when it
finds vulnerabilities** — that is its normal, documented behavior for a
non-empty result, not a failure of the command, so this lab's wrapper
treats a non-zero exit with valid JSON on stdout as a successful audit
run, and only a missing/unparseable JSON body as a real error.

This lab runs the audit **twice** — once for the full dependency graph
(including devDependencies) and once scoped to production only
(`--omit=dev`) — and reports both numbers honestly side by side: a real
observed run found **24 vulnerable advisories** across the full graph
(all in devDependencies — pre-existing `newman`/`postman` reporting chain
plus `testcontainers`'s `dockerode`/`undici` chain) and **0** in the
production-only scope. Reporting only the flattering number would be
dishonest; reporting only the alarming one would mischaracterize real
production risk.

## 3. Cross-referencing — can I see everything that's vulnerable?

An SBOM and an audit report are two different views of the same
dependency tree. `lib/cross-reference.js` asks the real question a
supply-chain review needs answered: is every package the audit flags as
vulnerable actually traceable as a component in the SBOM? A vulnerable
package **missing** from the SBOM is a real visibility gap — you cannot
govern risk in something you cannot see. In this run, the production-only
audit found zero vulnerable packages, so there was nothing to trace — the
lab reports that explicitly (`prodVulnerable=0`) rather than silently
skipping the check.

## 4. Lockfile integrity — and a real false-positive avoided

Every entry in `package-lock.json` resolved from a real external
registry URL carries an `integrity` SRI hash — the value npm verifies a
downloaded tarball against before installing it. Its absence is a real
supply-chain gap: without it, a compromised registry or a
machine-in-the-middle could substitute a different tarball at install
time with nothing to catch it.

Building this checker surfaced a real design trap. A first diagnostic
pass against this repository's real `package-lock.json` found **4**
entries with a `resolved` field but no `integrity` —
`node_modules/automation-labs`, `node_modules/qa-demo-system-api-tests`,
`node_modules/qa-demo-system-backend`, `node_modules/web-tests`. Flagging
these would have been a false positive: npm itself marks them
`link: true` because they are this repo's own local workspace packages,
symlinked rather than downloaded, and can never carry an integrity hash.
`lib/lockfile-integrity.js` explicitly excludes any entry with
`link: true` before checking for a missing hash — verified by a dedicated
test (`lockfile-integrity.test.js`, test 3) that proves this exact
exclusion, not just the positive-case detection.

## Scope boundary

This is not a commercial SCA tool (Snyk, Dependabot, Sonatype, etc.). It
does not do license-compliance checking, does not resolve beyond what
npm's own lockfile already resolved, and does not detect typosquatting or
other malicious-package heuristics. What is real: the SBOM is a genuine
CycloneDX document from npm's own tooling, the audit is npm's own real
vulnerability-database lookup, and the integrity check reads the actual
lockfile this repository installs from.

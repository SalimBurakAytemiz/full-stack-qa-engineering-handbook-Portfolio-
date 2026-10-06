# Testcontainers Lab — Execution Evidence

**Date:** 2026-10-02
**Environment:** sandbox container (confirmed: `docker` CLI present,
`docker info` fails — `connect: no such file or directory` on
`/var/run/docker.sock`; no daemon reachable).

## Run 1 — meta-tests for the error classifier

**Command:** `node --test automation-labs/testcontainers-lab/tests/classify-docker-error.test.js`
(from `QA-DEMO-SYSTEM/`).

**Result:** `1..5 / # pass 5 / # fail 0`. Exit code `0`.

## Run 2 — the real lab, this sandbox (no Docker daemon)

**Command:** `node automation-labs/testcontainers-lab/run-testcontainers-lab.js`
(from `QA-DEMO-SYSTEM/`) — independent review finding F8: this run's cwd was previously misdocumented as `QA-DEMO-SYSTEM/automation-labs/`, which combined with this exact command would resolve to a nonexistent doubled path (automation-labs/automation-labs/...); corrected to match the command's own automation-labs/ prefix.

**Actual observed output:**
```
TESTCONTAINERS_LAB: attempting to start a real container (nginx:alpine) via testcontainers ...
TESTCONTAINERS_LAB: no reachable Docker daemon (Could not find a working container runtime strategy)
TESTCONTAINERS_LAB_STATUS: EXTERNALLY_BLOCKED — real container execution requires a Docker daemon, which is not reachable in this environment. ...
```
Exit code `0`.

This is `testcontainers`'s own real error — not simulated. The lab really
called `GenericContainer(...).start()`, it really threw because this
sandbox has no Docker daemon, and the lab's classifier really matched that
real message against `lib/classify-docker-error.js`'s pattern list
(derived from this exact observed message).

## Run 3 — CI (GitHub Actions `ubuntu-latest`, real Docker daemon)

**Command:** the `testcontainers-lab` job in `.github/workflows/ci.yml`
ran this exact same script unmodified —
`https://github.com/SalimBurakAytemiz/full-stack-qa-engineering-handbook-Portfolio-/actions/runs/37078354997`
(commit `97da16f`, job "Testcontainers lab (real container lifecycle via
the real testcontainers library)", conclusion: success).

**Actual observed output (from the real CI job log):**
```
TESTCONTAINERS_LAB: attempting to start a real container (nginx:alpine) via testcontainers ...
TESTCONTAINERS_LAB: GET http://localhost:32769/ -> status 200, body contains 'nginx': true
TESTCONTAINERS_LAB_STATUS: EXECUTED — real container started, real mapped port, real HTTP response verified, real teardown follows.
```
Exit code `0`.

This confirms the exact prediction this file made in Run 2: `ubuntu-latest`
GitHub-hosted runners ship a real, running Docker daemon, so the same code
path that reported `EXTERNALLY_BLOCKED` in this sandbox genuinely started
the container, got a real mapped port, made a real HTTP request, and got a
real `200` response with the real nginx welcome page — in CI, this is
`EXECUTED`, not a fake pass and not a simulation. This lab's registry
maturity is `L4_CI_VERIFIED` / evidence `E4_CI_VERIFIED` on that basis,
mirroring every other CI_VERIFIED elevation in this campaign
(M2.1/M2.2/M2.3) — confirmed from the real run, never self-declared ahead
of one.

## Scope and honesty notes

- `GenericContainer`, port mapping, and teardown are all the real
  `testcontainers` library's real behavior — not mocked or stubbed.
- The EXTERNALLY_BLOCKED path is exercised and real in this environment;
  it is not a hypothetical "what if docker isn't there" branch that never
  actually runs — this *is* the real, observed result here.
- `npm audit` flags a `moderate` advisory for `testcontainers`
  (via `dockerode`, `undici`) — see `README.md`'s "Dependency note".

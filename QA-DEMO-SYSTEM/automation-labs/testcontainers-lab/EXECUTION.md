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
(from `QA-DEMO-SYSTEM/automation-labs/`).

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

Pending: the `testcontainers-lab` CI job runs this exact same script
unmodified. `ubuntu-latest` GitHub-hosted runners ship a running Docker
daemon, so the same code path that reported `EXTERNALLY_BLOCKED` here is
expected to genuinely start the container, serve a real HTTP response, and
report `EXECUTED`. This section will be updated with the real run URL and
output once that job's first green run is confirmed (see
`.github/workflows/ci.yml`), mirroring every other CI_VERIFIED elevation in
this campaign (M2.1/M2.2/M2.3) — never self-declared ahead of a real run.

## Scope and honesty notes

- `GenericContainer`, port mapping, and teardown are all the real
  `testcontainers` library's real behavior — not mocked or stubbed.
- The EXTERNALLY_BLOCKED path is exercised and real in this environment;
  it is not a hypothetical "what if docker isn't there" branch that never
  actually runs — this *is* the real, observed result here.
- `npm audit` flags a `moderate` advisory for `testcontainers`
  (via `dockerode`, `undici`) — see `README.md`'s "Dependency note".

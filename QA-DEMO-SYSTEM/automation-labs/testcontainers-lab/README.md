# Testcontainers Lab

A real container-based integration test, built on the real, industry-
standard [`testcontainers`](https://www.npmjs.com/package/testcontainers)
npm package — unlike most of this repository's other Part 2 labs, this one
deliberately uses the real third-party library rather than a hand-rolled
substitute, because there is no reasonable minimal substitute for "start a
real Docker container and wait for it to be ready": that is exactly the
problem Testcontainers exists to solve well, and reimplementing container
lifecycle management (image pull, port mapping, readiness polling, cleanup)
would be the dependency-bloat-avoidance principle applied backwards.

## What this lab actually does

`run-testcontainers-lab.js`:
1. Starts a real `nginx:alpine` container via `testcontainers`'s
   `GenericContainer`, exposing port 80.
2. Reads the real host/mapped-port testcontainers assigned and makes a
   real HTTP `GET` to it.
3. Asserts a real `200` status and that the real response body is the
   real nginx welcome page (not a stub, not a mock).
4. Always tears the container down in a `finally` block.

## Honest degraded mode — this environment has no Docker daemon

This sandbox has the `docker` CLI installed but **no reachable Docker
daemon** (confirmed: `docker info` fails with
`connect: no such file or directory` on `/var/run/docker.sock` — the exact
same limitation already documented for Phase 14's `docker-compose.yml`,
see `QA-DEMO-SYSTEM/evidence/PHASE-14-MODERN-QA-LEARNING-LABS/EXECUTION.md`).
`testcontainers` itself detects this and throws
`Could not find a working container runtime strategy`. The lab catches
exactly that real error, classifies it via `lib/classify-docker-error.js`,
and reports:

```
TESTCONTAINERS_LAB_STATUS: EXTERNALLY_BLOCKED
```

with exit code `0` — this is a disclosed, honest non-pass, never a faked
`EXECUTED`. GitHub Actions `ubuntu-latest` runners ship a real, running
Docker daemon by default, so the **exact same script**, unmodified, is
expected to genuinely start the container, make the real HTTP request, and
report `EXECUTED` there. See `EXECUTION.md` for the actual local run and
`.github/workflows/ci.yml`'s `testcontainers-lab` job for the CI wiring —
once that job's run is confirmed green, this lab is elevated to
`CI_VERIFIED` on the strength of that real CI execution, exactly like
every other lab in this campaign (never self-declared).

## Scope boundary

- One container, one image (`nginx:alpine`), one assertion. This is not a
  testcontainers tutorial covering databases, message brokers, or
  multi-container networks — it exists to prove the concept (real
  container lifecycle, driven from a real test, with honest fallback when
  the infrastructure isn't there) with the smallest real example.
- `lib/classify-docker-error.js`'s pattern list is derived from the real
  error this lab observed in this sandbox, not guessed in advance — see
  `tests/classify-docker-error.test.js`'s first case.

## Dependency note

Adding `testcontainers` (and its transitive dependencies `dockerode`,
`undici`) introduced a `moderate` severity advisory
(`npm audit`: testcontainers via dockerode/undici) on top of this
workspace's pre-existing `newman`/`postman-collection` advisory chain
(documented separately). `automation-labs` is a dev/test-tooling
workspace never shipped to production (`npm audit --omit=dev` at the repo
root reports `0 vulnerabilities`), so this is accepted and disclosed here
rather than silently ignored — consistent with this repository's existing
dependency-advisory-analysis practice.

## Run it

```bash
# from QA-DEMO-SYSTEM/ — no backend server needed, Docker daemon needed for a real EXECUTED result
node automation-labs/testcontainers-lab/run-testcontainers-lab.js
node --test automation-labs/testcontainers-lab/tests/classify-docker-error.test.js
```

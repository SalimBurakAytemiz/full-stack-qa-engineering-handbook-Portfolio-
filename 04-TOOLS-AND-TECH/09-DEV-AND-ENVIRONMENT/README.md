# Dev & Environment Tools

## Git / GitHub (T4 CI_VERIFIED)

The entire transformation and campaign history in this repository is
itself the evidence — real commits, real `git mv` history preservation
during the Handbook migration, real PR/merge history (PR #24).

## Node.js (T4 CI_VERIFIED)

Runtime for the entire backend and test suite; `node:sqlite` and
`node:test` (built-in, no external test-runner dependency) are used
deliberately to keep the dependency surface small.

## Docker (T2 EXAMPLE_AVAILABLE)

**Concepts:** OS-level containerization for reproducible environments.

**Setup:** `QA-DEMO-SYSTEM/Dockerfile` + `docker-compose.yml` +
`.dockerignore`.

**Real bug found and fixed:** `COPY shared /shared` placed the shared
test-data directory at the container filesystem root instead of
`/app/shared`, where `seed.js` actually looks for it — the image would
have built successfully but failed at runtime, a class of bug
`docker compose config` (syntax-only validation) cannot catch; the
path arithmetic was verified empirically with `node -e` instead.

**Environment limitation:** no Docker daemon has existed in any
environment this repository was built in — `docker compose config`
syntax validation passes; a real `docker build`/`docker run` has never
been executed.

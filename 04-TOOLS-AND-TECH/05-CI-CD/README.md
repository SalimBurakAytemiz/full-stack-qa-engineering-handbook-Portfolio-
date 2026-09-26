# CI/CD Tools

## GitHub Actions (T4 CI_VERIFIED)

**Concepts:** YAML-defined workflows triggered on push/PR, running on
GitHub-hosted runners — unlike a local sandbox, these runners have
real network access and standard browser/driver availability.

**Setup:** `.github/workflows/ci.yml` — four jobs: backend unit/
integration tests, Web QA (Playwright, real `playwright install`),
API schema validation (Newman/AJV against a real started server), and
Selenium lab (real browser automation — genuinely passes here even
though the identical code is environment-blocked in this repository's
own sandbox).

**Why this matters for QA methodology:** it's a real, repeatable
demonstration that "blocked in my sandbox" and "broken" are not the
same claim — the GitHub Actions results are the actual proof the code
itself is correct.

**Related evidence:** `.ai/PHASE-6-19-CODEX-AUDIT-MANIFEST.md` (real,
independently-verified run results, not assumed).

## Jenkins (T2 EXAMPLE_AVAILABLE)

**Concepts:** self-hosted or managed CI server, pipeline-as-code via
`Jenkinsfile` (declarative or scripted).

**Setup:** `QA-DEMO-SYSTEM/Jenkinsfile` — mirrors the same 3-stage
pipeline as `ci.yml`, syntax-valid, never executed (no real Jenkins
server has existed in any environment this repository was built in).

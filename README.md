# Salim Burak Aytemiz — Full Stack QA Engineering Handbook & Portfolio

Software QA Engineer, 5+ years, full stack (web / mobile / backend /
database / admin-panel-CMS). This repository is a working QA knowledge
system, not a static résumé: a personal competency model, a QA
handbook, and an executable reference platform with real, CI-verified
tests behind it.

## Start here

| You have... | Go to |
|---|---|
| 30 seconds | [`01-SALIM-BURAK-DIGITAL-TWIN/01-EXECUTIVE-TECHNICAL-PROFILE.md`](01-SALIM-BURAK-DIGITAL-TWIN/01-EXECUTIVE-TECHNICAL-PROFILE.md) |
| 5 minutes | [`01-SALIM-BURAK-DIGITAL-TWIN/`](01-SALIM-BURAK-DIGITAL-TWIN/) — competency matrix + gap map |
| 20 minutes | Competency → Professional Case → Executable Lab → Evidence, via the links below |

## Navigation

- **Review my technical profile** → [`01-SALIM-BURAK-DIGITAL-TWIN/`](01-SALIM-BURAK-DIGITAL-TWIN/)
  — what I know, what I've done professionally, what I've practiced in
  this repository, and where the honest gaps are. These are never
  merged into one "experience" claim.
- **Explore the QA handbook** → [`02-FULL-STACK-QA-HANDBOOK/`](02-FULL-STACK-QA-HANDBOOK/)
  — all 24 target topics (Foundations, Requirement Analysis, Risk &
  Test Design, Manual Testing, Software Architecture for QA, API/DB/
  Web/Mobile/Integration Testing, Automation, Performance, Security,
  Observability, CI/CD, Release, Test Management, Metrics, Agile/
  Leadership, 23 System Patterns, Modern QA, Learning Paths) have real,
  non-placeholder canonical content — see that folder's own README for
  the full index. The old root-level `0X-*` directories this section
  used to point to were migrated here (`git mv`, preserving history —
  see `.ai/DECISIONS.md` D2) and no longer exist at repo root.
- **Explore domain-specific QA knowledge** → [`03-DOMAINS/`](03-DOMAINS/)
  — E-Commerce, FinTech, Media/Streaming, Mobile/Multi-Country, and
  Insurance, each at a stated, real maturity level (D0-D5).
- **Browse the executable lab** → [`QA-DEMO-SYSTEM/`](QA-DEMO-SYSTEM/README.md)
  — a real Node.js/Express/SQLite application with Auth, Products,
  Orders, Payment, Events, Notifications, GraphQL, and WebSocket
  layers, exercised by Playwright, Selenium, JMeter, Locust, Postman/
  Newman/AJV, and a 160-test backend suite, wired into GitHub Actions
  CI. **Independent review finding F5:** `.ai/TEST-STATUS.md` is a
  **historical** Part 1 snapshot (160-test backend suite, 9 CI jobs,
  803 links checked) — it was never updated for Part 2/3's 21
  additional automation labs and does not reflect current, whole-repo
  results. For the current, full-project test/CI/registry results
  (backend 160/160, registry 0 errors, 444 relationships, 38 evidence,
  30 CI jobs) see
  [`.ai/CODEX-FULL-PROJECT-REVIEW-HANDOFF.md`](.ai/CODEX-FULL-PROJECT-REVIEW-HANDOFF.md)'s
  "Test results" table instead.
- **View evidence** → [`01-SALIM-BURAK-DIGITAL-TWIN/08-EVIDENCE-MAP.md`](01-SALIM-BURAK-DIGITAL-TWIN/08-EVIDENCE-MAP.md)
  indexes exactly where each piece of repository-practice evidence
  lives, and what an independent Codex audit already reviewed
  (`.ai/PHASE-6-19-CODEX-AUDIT-MANIFEST.md`).

## What this repository is not

It is not a claim that every technology mentioned anywhere in it was
used professionally — the Digital Twin's competency matrix separates
*knowledge*, *professional experience*, and *repository practice* on
every single item, specifically so that distinction can never blur.
It is not a recreation of any employer's actual system — `QA-DEMO-SYSTEM`
is a synthetic, public-safe application built to exercise the same
class of QA problems a professional system would raise, with no
employer source code, real customer data, or credentials anywhere in
it.

## Repository status

Phase 0-19 of the original roadmap are implementation-complete and
independently Codex-audited (final verdict: **PASS**, merged to `main`
— see [`ROADMAP.md`](ROADMAP.md) for the phase-by-phase status table).
The larger transformation into a Digital Twin + QA Handbook + Domain
Knowledge Base + Executable Labs system is implementation-complete for
that merged scope (every implementable master-transformation
requirement is COMPLETE — see `.ai/MASTER-REQUIREMENTS-COMPLIANCE.md`)
and went through multiple rounds of independent Codex verification and
fix campaigns, tracked in
[`.ai/CODEX-FULL-AUDIT-HANDOFF.md`](.ai/CODEX-FULL-AUDIT-HANDOFF.md) —
**but that document covers only this merged Part 1 scope (Phases
0-19)**, not the current state of the whole project.

**Current, full-project state: COMPLETED.** Part 2 (Advanced/
Next-Generation QA Engineering) and Part 3 (Platform Engineering &
Quality Gates) — 21 more real, CI-verified automation labs — went
through their own independent review and fix pass (findings F1–F8, all
fixed) and are merged to `main` via PR #26, with post-merge `main` CI
green. Parts 1, 2 and 3 are all complete and merged. For the current,
whole-repository status, see
[`.ai/MASTER-STATE.yaml`](.ai/MASTER-STATE.yaml) (`project_final_status`).
For the Parts 2/3 review record, see
[`.ai/CODEX-FULL-PROJECT-REVIEW-HANDOFF.md`](.ai/CODEX-FULL-PROJECT-REVIEW-HANDOFF.md),
not the Part-1-only document above.

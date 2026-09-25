# About This Repository

## "Why does this repository separate 'what you know' from 'what you did at work' from 'what you built here'?"

Because those are three different facts and conflating them is exactly
how QA portfolios become misleading. A tool used once in a tutorial and
a tool run daily in production for years look identical if the only
signal is "listed on the resume." The competency model
(`01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml`) keeps
`knowledge`, `professional`, and `repository` as three independent
fields precisely so a reader — or a registry validator — can tell them
apart.

## "This repository has a lot of 'gap' and 'not done' labels. Isn't that a weakness to hide?"

No — the opposite. `06-EVIDENCE/evidence.yaml`'s maturity scale tops out
at `E5_INDEPENDENTLY_AUDITED`, and the rule enforced throughout this
repository is that no entry may claim that level without a real external
audit record — Claude, or any author, cannot self-declare it. The same
discipline applies to gaps: they are visible by design
(`09-GAP-AND-LEARNING-MAP.md`), not filtered out to look more complete.

## "How do you know the registry claims are actually true?"

`scripts/registry/validate-registry.mjs` is a real, runnable validator —
not documentation describing a system that doesn't exist. It checks
every registry YAML against a JSON Schema, verifies every gap reference
resolves to a real entry, and checks every evidence artifact path exists
on disk at validation time. It was deliberately run against a fabricated
reference and a disallowed schema property to confirm it actually fails
before being used to validate the real content — see `.ai/DECISIONS.md`.

## "What's `QA-DEMO-SYSTEM` vs. `05-EXECUTABLE-LABS`?"

`QA-DEMO-SYSTEM` is the real, running code — backend, tests, CI. It was
not moved or renamed during this transformation because it has a
passing 157-test suite and a 4-job GitHub Actions pipeline that both
depend on its current file paths. `05-EXECUTABLE-LABS/README.md` is a
documented index over that code, mapping each real path to a stable
`lab.*` registry id — a decision made explicitly to avoid risking a
working system for a cosmetic reorganization.

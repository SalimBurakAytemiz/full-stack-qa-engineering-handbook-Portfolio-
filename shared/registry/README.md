# Universal Registry

This is the claim-integrity enforcement mechanism for the whole
repository (master transformation spec, Section 37-41): a real, runnable
validator — not just documentation describing a system that doesn't run.
It is wired into CI as a real quality gate (`.github/workflows/ci.yml`,
job `registry-integrity`) — a push or PR with a registry regression fails
the build, it does not merely print a warning.

```
npm install          # once, at repo root
npm run registry:validate      # validates every registry YAML against its schema
npm run registry:build-indexes # regenerates shared/registry/generated/REGISTRY-INDEX.md
```

## What lives where

| File | Owns |
|---|---|
| `01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml` | Salim's knowledge/professional/repository state per competency |
| `01-SALIM-BURAK-DIGITAL-TWIN/registry/domain-state.yaml` | Salim's personal exposure per domain (references `domains.yaml` by `domain_id`) |
| `01-SALIM-BURAK-DIGITAL-TWIN/registry/tool-state.yaml` | Tool/technology/platform/protocol catalog (owned here — one person, one repository, no separate universal layer needed) |
| `01-SALIM-BURAK-DIGITAL-TWIN/registry/gaps.yaml` | Every gap id referenced by `competencies[].gaps` |
| `01-SALIM-BURAK-DIGITAL-TWIN/registry/professional-experience.yaml` | Salim's professional cases (each requires a `sanitized` boolean) |
| `01-SALIM-BURAK-DIGITAL-TWIN/registry/claims.yaml` | **Claim-level provenance** — one entry per individual `what_i_did`/`other_professional_project_exposure` bullet in professional-experience.yaml, each with its own `source_id` (P1-05 post-Codex fix; see "Claim-level provenance" below) |
| `shared/registry/catalog/domains.yaml` | This repository's own domain maturity (D0-D5), independent of personal exposure — uses `domain-catalog.schema.json`, never `exposure` vocabulary (P2-01 post-Codex fix) |
| `shared/registry/catalog/labs.yaml` | Executable lab catalog (L0-L5), each entry pointing at real code |
| `shared/registry/catalog/patterns.yaml` | System pattern catalog (Section 13), each pointing at a real Handbook doc |
| `06-EVIDENCE/evidence.yaml` | Evidence maturity (E0-E5) with artifact paths checked against the filesystem |
| `shared/registry/relationships/relationships.yaml` | Controlled-vocabulary edges between all of the above (see the live count in `REGISTRY-INDEX.md`'s "Relationships" heading — do not hardcode a count here, it drifts) |

## Claim-level provenance (P1-05 post-Codex fix — the most important integrity fix)

A file-level source declaration ("some source covers professional-experience.yaml as a whole") cannot catch a single fabricated bullet inserted into that file — nothing checked individual claims before this fix, so Codex proved an invented `what_i_did` action could be inserted and registry validation still passed.

`01-SALIM-BURAK-DIGITAL-TWIN/registry/claims.yaml` closes this: every real `what_i_did` bullet (across all `professional_cases`) and every `other_professional_project_exposure` item has an exact-text-matching `claim.*` entry, each carrying its own `source_id` (must resolve to a real `source-provenance.yaml` source). The validator checks BOTH directions:

1. Every live bullet in `professional-experience.yaml` must have a matching, `SOURCED` claim — an unmatched bullet (inserted, fabricated, or edited without updating `claims.yaml`) fails with "unsourced professional claim."
2. Every `SOURCED` claim must still match a live bullet — a stale claim left behind after a bullet is removed, or one whose text has drifted from the real bullet, also fails.

Editing a real `what_i_did`/`other_professional_project_exposure` bullet's wording requires updating its matching `claims.yaml` entry in the same change — this is intentional friction, not a bug: it is the mechanism that makes claim-level provenance enforceable rather than aspirational. `scripts/registry/validate-registry.regression.test.mjs` proves this negative case actually fails (not just asserted to) by injecting a real fabricated bullet into the real file and asserting a non-zero exit code, then reverting.

## Domain foreign-key integrity (P2-01 post-Codex fix)

Every personal `domain_id` in `01-SALIM-BURAK-DIGITAL-TWIN/registry/domain-state.yaml` must resolve to a real entry in the universal `shared/registry/catalog/domains.yaml` catalog — the personal file's own header comment always documented this as the intent ("domain_id here is a REFERENCE, not a definition"), but nothing checked it until this fix. `domains.yaml` also no longer carries an `exposure` field (personal-exposure vocabulary) — it uses `domain-catalog.schema.json`, whose only status field is `maturity` (D0-D5, the domain's own repository-content depth, never a person's exposure level).

## What the validator actually checks

- Every entry against its JSON Schema (`shared/registry/schemas/*.schema.json`), including relation predicate values (an unknown relation type is a schema failure).
- No duplicate ids within an id-owning namespace.
- Every `competencies[].gaps` reference resolves to a real `gaps.yaml` entry.
- Every `evidence.yaml` `artifact` path and every catalog entry's `path` exists on disk at validation time.
- Every `evidence.yaml` `related_lab` resolves to a real `labs.yaml` entry.
- Every `relationships.yaml` edge's `from` and `to` resolve to a real, already-loaded registry entry — not just a shape that looks like an id ("missing relation targets").
- Every professional case in `professional-experience.yaml` declares a `sanitized` boolean, and `source-provenance.yaml` declares a source covering `professional-experience` — "invalid professional claims without provenance" (file-level).
- **Claim-level provenance** (P1-05): every individual `what_i_did`/`other_professional_project_exposure` bullet has an exact-matching, source-resolvable `claims.yaml` entry, in both directions — see above.
- **Domain foreign keys** (P2-01): every personal `domain_id` in `domain-state.yaml` resolves to a real `domains.yaml` catalog entry.
- Orphan evidence: every evidence entry must be linked from a lab (`related_lab`) or referenced by a relationship edge.
- Orphan labs: every lab must be linked from an evidence entry or referenced by a relationship edge.
- CI_VERIFIED without CI evidence: every competency with `repository.status: CI_VERIFIED` must have a relationship edge to an evidence entry whose maturity is `E4_CI_VERIFIED` or higher.
- **Relationship semantics** (P1-04): no `PRACTICED_IN` edge may originate from a competency whose own `repository.status` is `NOT_PRACTICED` — that would directly contradict the competency's own declared state (this is what structurally prevents the class of bug Codex found: `elastic-log-analysis`/`jenkins` edges claiming repository execution that never happened).
- AUDITED/E5 without independent audit evidence: enforced both structurally (the evidence schema's `if/then` requires `audit_record` for E5) and as an explicit runtime check.
- Generated-output drift: `shared/registry/generated/REGISTRY-INDEX.md` is regenerated in memory and diffed against the committed file — **EOL-normalized** (P2-02 post-Codex fix: a CRLF-vs-LF-only difference, e.g. from a Windows checkout, does not fail; real content drift still does).

This was verified to actually fail, not just pass by construction, on
real injected defects — not only synthetic ones:

- A fabricated gap reference and a lab entry with a disallowed schema
  property were both deliberately introduced and confirmed to produce a
  non-zero exit code before being reverted.
- While building the extended predicate vocabulary and the 133-edge
  relationship graph, the validator's own new checks caught real,
  unintentional defects during development itself: the old relationship
  predicate names (`DEMONSTRATED_BY`, `PRODUCES_EVIDENCE`, etc.) failed
  schema validation the moment the enum was tightened; `lab.observability.elastic-log-analysis`
  was flagged as a genuine orphan until a real evidence link was added;
  and 11 competencies claiming `CI_VERIFIED` were flagged as unsupported
  until real `EVIDENCED_BY` edges were added, one per competency, each
  checked against the actual backend test files that cover it. None of
  these were staged failures — they were real defects the validator
  found in what had actually been written. See `.ai/DECISIONS.md`.

## Regression tests

`scripts/registry/validate-registry.regression.test.mjs` (`node --test
scripts/registry/validate-registry.regression.test.mjs`) proves the
validator's negative AND positive behavior against real files, not
synthetic fixtures: each test mutates a real registry/contract file on
disk, runs the real validator (or the real GraphQL contract-drift test)
exactly as CI would, asserts the expected PASS/FAIL, and restores the
original content. Covers: fabricated professional claim (fail),
missing domain foreign key (fail), unsupported CI_VERIFIED claim
(fail), CRLF-only drift in the generated index (pass) and in the
GraphQL contract snapshot (pass), real content drift in both (fail),
and a PRACTICED_IN edge contradicting a NOT_PRACTICED competency
(fail).

## What it does not yet check

- The relationship graph is deliberately not exhaustive — only entities
  with real, already-built content on both ends are linked (see
  `.ai/KNOWN-ISSUES.md`). The two mandated traceability paths
  (COMPETENCY → DOMAIN/PATTERN → TOOL → LAB → EVIDENCE, and
  PROFESSIONAL EXPERIENCE → DOMAIN → COMPETENCY → repository evidence)
  are confirmed walkable for the E-Commerce/FinTech core, not for every
  possible entity combination.

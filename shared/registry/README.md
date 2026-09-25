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
| `shared/registry/catalog/domains.yaml` | This repository's own domain maturity (D0-D5), independent of personal exposure |
| `shared/registry/catalog/labs.yaml` | Executable lab catalog (L0-L5), each entry pointing at real code |
| `shared/registry/catalog/patterns.yaml` | System pattern catalog (Section 13), each pointing at a real Handbook doc |
| `06-EVIDENCE/evidence.yaml` | Evidence maturity (E0-E5) with artifact paths checked against the filesystem |
| `shared/registry/relationships/relationships.yaml` | Controlled-vocabulary edges between all of the above (133 edges as of this writing) |

## What the validator actually checks

- Every entry against its JSON Schema (`shared/registry/schemas/*.schema.json`), including relation predicate values (an unknown relation type is a schema failure).
- No duplicate ids within an id-owning namespace.
- Every `competencies[].gaps` reference resolves to a real `gaps.yaml` entry.
- Every `evidence.yaml` `artifact` path and every catalog entry's `path` exists on disk at validation time.
- Every `evidence.yaml` `related_lab` resolves to a real `labs.yaml` entry.
- Every `relationships.yaml` edge's `from` and `to` resolve to a real, already-loaded registry entry — not just a shape that looks like an id ("missing relation targets").
- Every professional case in `professional-experience.yaml` declares a `sanitized` boolean, and `source-provenance.yaml` declares a source covering `professional-experience` — "invalid professional claims without provenance."
- Orphan evidence: every evidence entry must be linked from a lab (`related_lab`) or referenced by a relationship edge.
- Orphan labs: every lab must be linked from an evidence entry or referenced by a relationship edge.
- CI_VERIFIED without CI evidence: every competency with `repository.status: CI_VERIFIED` must have a relationship edge to an evidence entry whose maturity is `E4_CI_VERIFIED` or higher.
- AUDITED/E5 without independent audit evidence: enforced both structurally (the evidence schema's `if/then` requires `audit_record` for E5) and as an explicit runtime check.
- Generated-output drift: `shared/registry/generated/REGISTRY-INDEX.md` is regenerated in memory and diffed byte-for-byte against the committed file.

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

## What it does not yet check

- The relationship graph is deliberately not exhaustive — only entities
  with real, already-built content on both ends are linked (see
  `.ai/KNOWN-ISSUES.md`). The two mandated traceability paths
  (COMPETENCY → DOMAIN/PATTERN → TOOL → LAB → EVIDENCE, and
  PROFESSIONAL EXPERIENCE → DOMAIN → COMPETENCY → repository evidence)
  are confirmed walkable for the E-Commerce/FinTech core, not for every
  possible entity combination.

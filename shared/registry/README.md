# Universal Registry

This is the claim-integrity enforcement mechanism for the whole
repository (master transformation spec, Section 37-41): a real, runnable
validator — not just documentation describing a system that doesn't run.

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
| `shared/registry/catalog/domains.yaml` | This repository's own domain maturity (D0-D5), independent of personal exposure |
| `shared/registry/catalog/labs.yaml` | Executable lab catalog (L0-L5), each entry pointing at real code |
| `06-EVIDENCE/evidence.yaml` | Evidence maturity (E0-E5) with artifact paths checked against the filesystem |
| `shared/registry/relationships/relationships.yaml` | Controlled-vocabulary edges between all of the above |

## What the validator actually checks

- Every entry against its JSON Schema (`shared/registry/schemas/*.schema.json`).
- No duplicate ids within an id-owning namespace.
- Every `competencies[].gaps` reference resolves to a real `gaps.yaml` entry.
- Every `evidence.yaml` `artifact` path exists on disk at validation time.
- Every `evidence.yaml` `related_lab` resolves to a real `labs.yaml` entry.
- Every `relationships.yaml` edge is schema-valid (from/predicate/to shape).

This was verified to actually fail, not just pass by construction: a
fabricated gap reference and a lab entry with a disallowed schema
property were both deliberately introduced and confirmed to produce a
non-zero exit code before being reverted (see `.ai/DECISIONS.md`).

## What it does not yet check

- Full graph-level dangling-reference checking for `relationships.yaml`
  against ids outside the personal registry and current catalog (the
  catalog is intentionally not exhaustive — see `03-DOMAINS/README.md`).
- `tool-state.yaml` and `competency-state.yaml` do not yet have a CI job
  wired to run `npm run registry:validate` automatically; it is a local
  gate today (see `.ai/KNOWN-ISSUES.md`).

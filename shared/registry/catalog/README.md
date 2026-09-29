# Universal Registry Catalog

Catalog entries here define competencies/domains/tools/labs **independent
of any one person** — "what does this domain/tool/lab mean in this
repository," not "what has Salim done with it." Personal state against
these definitions lives in `01-SALIM-BURAK-DIGITAL-TWIN/registry/` and
points back here by id.

- `domains.yaml` — domain catalog with this repository's own D0-D5
  maturity per domain (see `03-DOMAINS/README.md`).
- `labs.yaml` — executable lab catalog with L0-L5 maturity, each entry
  pointing at real, checked-in code.

Tools and competencies do not have a separate universal-catalog file:
`01-SALIM-BURAK-DIGITAL-TWIN/registry/tool-state.yaml` and
`competency-state.yaml` are already the single real owner of those ids in
this repository (there is exactly one person's state being tracked here,
so a separate "universal" layer would just duplicate them — see the
"one fact, one owner" rule in `shared/registry/schemas/`).

Evidence has its own registry at `06-EVIDENCE/evidence.yaml` (not under
`catalog/`) because Section 33-35 treats it as a first-class root
subsystem, not a sub-catalog.

Validate everything with:

```
npm run registry:validate
```

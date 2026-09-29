# Salim Burak — Technical Digital Twin

This section answers four questions about one person, and keeps them
strictly separate:

- **What does Salim know?** → knowledge level
- **What has he done professionally?** → professional status
- **What has he practiced in this repository?** → repository status
- **Where are the gaps?** → visible, not hidden

These four dimensions are never collapsed into a single "experience"
label. A repository lab proves repository practice — it does not prove
professional employment, and a professional case does not automatically
imply the same implementation exists in this public repository. The
exact precedence used when sources disagree lives in
`registry/source-provenance.yaml`.

## Reading order

| Time budget | Read |
|---|---|
| 30 seconds | `01-EXECUTIVE-TECHNICAL-PROFILE.md` |
| 5 minutes | `02-COMPETENCY-MATRIX.md` + `09-GAP-AND-LEARNING-MAP.md` |
| 20 minutes | everything below, in order |

## Documents

1. [`01-EXECUTIVE-TECHNICAL-PROFILE.md`](01-EXECUTIVE-TECHNICAL-PROFILE.md) — one-screen summary.
2. [`02-COMPETENCY-MATRIX.md`](02-COMPETENCY-MATRIX.md) — knowledge / professional / repository, per competency.
3. [`03-KNOWLEDGE-MAP.md`](03-KNOWLEDGE-MAP.md) — knowledge levels grouped by area.
4. [`04-PROFESSIONAL-EXPERIENCE.md`](04-PROFESSIONAL-EXPERIENCE.md) — sanitized professional context, narrative form.
5. [`05-DOMAIN-EXPERIENCE.md`](05-DOMAIN-EXPERIENCE.md) — which business domains, at what exposure level.
6. [`06-TOOLS-AND-TECHNOLOGY.md`](06-TOOLS-AND-TECHNOLOGY.md) — tools/technologies/platforms/protocols, with owner state.
7. [`07-PROFESSIONAL-CASE-MAP.md`](07-PROFESSIONAL-CASE-MAP.md) — one card per professional context.
8. [`08-EVIDENCE-MAP.md`](08-EVIDENCE-MAP.md) — where the repository evidence actually lives.
9. [`09-GAP-AND-LEARNING-MAP.md`](09-GAP-AND-LEARNING-MAP.md) — what is explicitly NOT claimed yet.
10. [`10-CERTIFICATIONS.md`](10-CERTIFICATIONS.md) — completed vs. planned.
11. [`11-CAREER-TIMELINE.md`](11-CAREER-TIMELINE.md) — professional contexts, ordering caveat included.
12. [`12-DEEP-TECHNICAL-PROFILE.md`](12-DEEP-TECHNICAL-PROFILE.md) — how Salim actually approaches an unfamiliar system.

## Machine-readable source of truth

The prose above is generated **from**, and must stay consistent with,
the registry in [`registry/`](registry/):

- `profile.yaml` — identity and summary.
- `competency-state.yaml` — the three-dimensional (knowledge /
  professional / repository) state per competency. This is the single
  owner of every competency fact — narrative docs reference it, they
  do not restate it independently.
- `domain-state.yaml` — personal exposure per business domain.
- `tool-state.yaml` — tool/technology/platform/protocol categorization.
- `professional-experience.yaml` — the sanitized professional cases.
- `gaps.yaml` — the visible gap list (Section 38 model: KNOWLEDGE /
  PROFESSIONAL_EXPOSURE / PRACTICE / EVIDENCE / CERTIFICATION /
  DOMAIN / TOOL_DEPTH).
- `certifications.yaml` — completed (currently none) vs. planned.
- `source-provenance.yaml` — where every fact above came from, and the
  precedence rule used when two sources disagree.

## Status of this section

This Digital Twin was built directly from an explicit, canonical
personal-data source provided by the repository owner (see
`registry/source-provenance.yaml`). It is complete for the competencies,
domains, tools, and professional context explicitly named in that
source. It is **not** a claim that every possible QA competency has
been evaluated — anything not listed here is `UNKNOWN`, not `NONE`.

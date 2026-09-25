# Pattern: Audit Log

## How it works

Every significant state change (who did what, when, and — often —
why) is recorded in an append-only, tamper-resistant log, separate
from the application's own operational logs.

## Why systems use it

Compliance (proving what happened, when a regulator or auditor asks),
security investigation (reconstructing an incident), and dispute
resolution (a customer disputes a charge — the audit log is the record
of what the system actually did) all depend on this existing and being
trustworthy.

## Status in this repository

**Partially analogous, not a true audit log.** `QA-DEMO-SYSTEM`'s
`events` table (`event_id`, `event_type`, `user_id`, `order_id`,
`payload`, `created_at` — see
`QA-DEMO-SYSTEM/backend/src/services/events.service.js`) records
domain events, which is structurally similar to an audit log's
append-only, timestamped design — but it exists to drive notifications
(`22-SYSTEM-PATTERNS/ASYNC-EVENTS.md`), not for compliance/audit
purposes, and it isn't comprehensive (it only covers `order.paid`, not
every state-changing action in the system). Calling this "an audit
log" would overstate what it actually does.

## QA Risks (in a system with a real, dedicated audit log)

- **Incomplete coverage**: an audit log that covers most but not all
  state-changing actions has a gap an investigator won't know exists
  until they need the missing entry.
- **Mutable audit records**: if audit entries CAN be edited or deleted
  by the same privilege level that writes application data, the log's
  entire value as tamper-evidence is undermined.
- **Insufficient context**: an entry recording "status changed" without
  who/why/from-what-value is compliance-inadequate even if it's
  technically an audit trail.
- **PII over-retention**: an audit log that captures full request
  bodies (including passwords, payment details) becomes its own data
  breach liability — the same redaction discipline this repository's
  real HTML test reports already apply (`04-TOOLS-AND-TECH/01-API-AND-CONTRACT/README.md`'s
  reporting redaction) is the same principle, applied at the audit-log
  design level.

## Test Strategy

**Positive:** every defined significant action produces exactly one
audit entry with the expected fields. **Negative:** an attempt to
modify/delete an existing audit entry is rejected (verifying
append-only enforcement, not just assuming it). **Coverage:** an
explicit checklist of every state-changing endpoint, cross-checked
against what actually gets logged — this is the test that catches the
"incomplete coverage" risk above, and it can't be automated away; it
requires a human review of the action inventory.

## Related System Patterns

`ASYNC-EVENTS.md` (the closest real implementation in this repository,
with the caveat above), `AUTHORIZATION.md` (who is allowed to READ
audit logs is itself a real access-control question).

## Related Domains

Insurance (underwriting-decision audit trail — see that domain's own
API/Data Risks section), any regulated domain.

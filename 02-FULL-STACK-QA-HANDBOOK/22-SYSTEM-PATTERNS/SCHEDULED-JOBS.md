# Pattern: Scheduled Jobs

## How it works

Work runs on a time-based trigger (a cron schedule, an interval) rather
than in response to a user request — a nightly report, a subscription
renewal check, a cache-warming job.

## Why systems use it

Some work is inherently periodic (insurance policy renewal reminders,
daily reconciliation) rather than event-driven, and doesn't belong in
the request/response path of any single user interaction.

## Status in this repository

**Not implemented.** `QA-DEMO-SYSTEM` has no scheduled/cron job —
every piece of backend logic runs synchronously in response to an
HTTP request or a WebSocket connection. `Insurance's real-world
renewal/cancellation lifecycle` (`03-DOMAINS/01-FINANCIAL-SERVICES/INSURANCE/README.md`)
is the clearest example in this repository's own domain content of
where this pattern WOULD apply — a renewal reminder is a scheduled-job
concept — but no such job exists here, and this page doesn't pretend
otherwise.

## QA Risks

- **Overlapping runs**: a job that takes longer than its own interval
  can start a second instance before the first finishes — a
  concurrency risk (`CONCURRENCY.md`) specific to time-triggered work,
  not request-triggered work.
- **Missed runs on downtime**: if the process/server is down when a
  job should have fired, does the system catch up on restart or
  silently skip that run? Both are defensible design choices that need
  an explicit answer and test.
- **Idempotency across retries**: a job that partially completes then
  crashes and retries needs the same idempotency guarantee
  (`IDEMPOTENCY.md`) a webhook receiver or a payment retry needs — "did
  this job already send the renewal email" is exactly the same shape
  of question as "did this order already get charged."
- **Timezone/DST bugs**: a job scheduled for "2am daily" behaves
  differently around a daylight-saving transition depending on how the
  scheduler handles it — a real, recurring bug class specific to this
  pattern.

## Test Strategy

**Positive:** the job runs at its scheduled time and produces the
expected effect. **Negative:** the job encountering an error partway
through doesn't leave partial/corrupt state. **Concurrency:** simulate
an overlapping-run scenario directly (don't just trust the scheduler's
own locking, if any) — this needs the same explicit concurrent-request
testing technique as `order-concurrency.test.js` uses for HTTP
requests, applied to job triggers instead.

## Related System Patterns

`IDEMPOTENCY.md`, `CONCURRENCY.md`, `RETRY.md` — all directly
applicable to a scheduled job's own execution.

## Related Domains

Insurance (renewal reminders, recurring premium billing).

# FinTech — Actors

- **Customer** — initiates transactions, views balance/history, subject to KYC/AML checks.
- **Support/Ops** — investigates disputed transactions, can freeze an account (subject to authorization rules — see `22-SYSTEM-PATTERNS/AUTHORIZATION.md`).
- **Compliance/AML system** — monitors transactions for suspicious patterns; QA-relevant because a false negative (missed suspicious activity) and a false positive (legitimate transaction blocked) are both real defect classes.
- **Settlement/reconciliation job** — a scheduled process reconciling ledger vs. external systems; its own idempotency (does re-running it twice double-settle?) is a QA target.
- **Third-party payment/banking rail** — external system a transaction ultimately depends on; timeouts and partial failures here need the same handling as `22-SYSTEM-PATTERNS/PAYMENT.md` describes.

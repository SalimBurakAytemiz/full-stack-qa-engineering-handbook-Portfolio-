# FinTech — Interview Questions

1. **Two withdrawal requests hit the same account with just enough
   balance for one. How do you design a test to prove the system
   handles this correctly, and what does "correctly" even mean here?**
   Expect: real concurrent requests (not sequential), exactly one
   succeeds, final balance is correct, no negative balance — see
   `22-SYSTEM-PATTERNS/CONCURRENCY.md`.

2. **A payment gateway times out. The client doesn't know if the
   charge went through. What's the risk, and how do you test for it?**
   Expect: distinguish timeout from decline; idempotent retry/
   reconciliation, not blind re-charge — see `PAYMENT.md` and
   `22-SYSTEM-PATTERNS/RETRY.md`.

3. **How do you test that a cached balance field hasn't drifted from
   the ledger?** Expect: recompute from raw ledger entries
   independently, compare — never trust the cached field as its own
   oracle.

4. **Why treat FAILED and TIMEOUT as different transaction states?**
   Expect: FAILED is a known outcome; TIMEOUT is an unknown outcome —
   conflating them risks either a false "it failed" (leading to an
   unsafe retry) or a false "it succeeded" assumption.

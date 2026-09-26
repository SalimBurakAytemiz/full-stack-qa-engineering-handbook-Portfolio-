# E-Commerce — Interview Questions

1. **How would you test that stock never goes negative under real
   concurrent checkout traffic?** Expect: `Promise.all`-fired
   concurrent requests against the last unit, assert exactly one
   winner, final stock exactly 0 — see `order-concurrency.test.js`.

2. **A GraphQL mutation and a REST endpoint both create orders. How do
   you make sure a side effect (like a WebSocket notification) isn't
   silently missing from one of them?** Expect: an explicit
   cross-transport regression test, not an assumption that "the
   business logic is shared so it must be fine" — this repository had
   exactly this bug (B1) until a dedicated test caught it.

3. **How do you decide what NOT to claim is tested?** Expect: checking
   what the frontend actually has (grep for cart/checkout UI) before
   writing a test plan that assumes a feature exists.

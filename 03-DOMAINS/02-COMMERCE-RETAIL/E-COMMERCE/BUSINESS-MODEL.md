# E-Commerce — Business Model

Revenue = unit price × quantity, minus discounts, plus tax, realized
only once payment is confirmed. The QA-relevant business rule: the
order total shown to the customer BEFORE payment must equal the amount
actually charged AND the amount reflected in the persisted order row
after payment — a three-way check (quote, charge, persisted total)
this repository's tests apply directly.

## Stock is a shared, contended resource

Every order competes for the same finite stock pool. This is why
`CONCURRENCY.md` in System Patterns and the overselling risk below are
central to this domain rather than an edge case — under any real
traffic, two customers WILL occasionally race for the same last unit.

# Pattern: Third-Party Integration

## How it works

The system delegates part of its functionality to an external
provider (payment processing, streaming infrastructure, identity/SSO)
via that provider's API, SDK, or webhook contract — the system owns
the integration logic, not the underlying capability.

## Why systems use it

Building payment processing, video infrastructure, or identity
federation from scratch is rarely the right call when a mature
provider already solves it — the tradeoff is control and depth of
testability for speed and reduced liability (PCI compliance, for
instance, is largely the provider's problem once integrated correctly).

## Status in this repository

**Modeled with a deliberate synthetic provider, not a real one.**
`QA-DEMO-SYSTEM`'s `payment.service.js` uses deterministic fake tokens
(`TEST-CARD-APPROVED`, `TEST-CARD-DECLINED`) rather than a real payment
processor — see `22-SYSTEM-PATTERNS/PAYMENT.md`. This is the
architecturally correct choice for this repository's scope (a real
provider integration needs real credentials this repository
deliberately never stores), and it's also exactly what makes the
integration point testable deterministically — the same tradeoff this
domain page's professional-experience sources describe for
AWS/MUX/Agora (`03-MEDIA-STREAMING/README.md`): sanitized integration
exposure, never simulated proprietary internals.

## QA Risks

- **Provider contract drift**: the third party changes their API
  response shape without warning — this is exactly the class of risk
  this repository's own `shared/contracts/` GraphQL/WebSocket
  drift-detection machinery exists to catch for internal contracts;
  most systems have no equivalent guard for THIRD-PARTY contracts,
  which is a real, common gap.
- **Provider outage handling**: does the system degrade gracefully
  (queue and retry) or fail every dependent request when the provider
  is down? This is `TIMEOUT.md` and `RETRY.md` applied specifically to
  an external dependency you don't control.
- **Credential/key exposure**: the single highest-severity risk in this
  pattern — a provider API key committed to source control or shipped
  in client code is a real, severe finding (this repository's own
  confidentiality checklist, `.ai/CODEX-FULL-AUDIT-HANDOFF.md`, exists
  partly to prevent exactly this).
- **Environment/sandbox drift**: a provider's sandbox/test environment
  behaving differently from production is a real source of "worked in
  testing, failed in prod" bugs that no amount of testing against the
  sandbox alone can catch.

## Test Strategy

**Positive:** successful integration call, using a synthetic/sandbox
credential exactly like this repository's own `TEST-CARD-APPROVED`
pattern. **Negative:** provider returns an error, provider times out,
provider returns a malformed/unexpected response shape. **Contract:**
periodic validation that the provider's real API still matches what
the integration code assumes (a real-world analog of this repository's
own contract-drift tests, applied outward instead of inward).

## Related System Patterns

`PAYMENT.md` (the concrete example in this repository), `TIMEOUT.md`,
`RETRY.md`, `WEBHOOK.md` (many third-party integrations notify via
webhook).

## Related Domains

Media/Streaming (AWS/MUX/Agora), Insurance (underwriting/payment
processors), FinTech.

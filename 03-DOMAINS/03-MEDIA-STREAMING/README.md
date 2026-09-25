# Domain: Media / Streaming

**Maturity:** D1 DOCUMENTED (domain knowledge written; no dedicated
executable lab in this repository yet).

## Domain model (concepts, not implemented code)

```
Admin -> Provider configuration -> Backend -> Stream creation -> Session
-> SDK/client configuration -> Viewer join -> Realtime events -> Disconnect/reconnect -> Stream end
```

## QA risk catalog

| Risk | Why it matters |
|---|---|
| Invalid provider key/config | Should fail fast with a clear error, not a generic timeout |
| Expired session token mid-stream | Viewer should be gracefully disconnected, not silently stuck |
| Provider timeout | Distinguish "provider is down" from "our backend is down" — different remediation |
| Duplicate stream start | Same stream started twice should not create two independent sessions |
| Concurrent viewers | Viewer count and per-viewer state must stay consistent under real concurrent joins |
| Out-of-order / duplicate realtime event | Same class of risk as `22-SYSTEM-PATTERNS/ASYNC-EVENTS.md` |
| Backend/client stream-status mismatch | Backend says "live", client SDK reports "connecting" — a real, user-visible bug class |

## Public-safe testing approach

Any executable lab for this domain must use fake provider names
(`FAKE_PROVIDER_A`, `FAKE_PROVIDER_B`) and never store real provider
credentials — per the transformation spec's explicit rule (Section 18)
and this repository's confidentiality checklist. **Not yet built** —
tracked in `.ai/NEXT-ACTIONS.md`.

## Professional context

Real (sanitized) professional experience in this exact domain exists —
see
`01-SALIM-BURAK-DIGITAL-TWIN/registry/professional-experience.yaml#pro.streaming.sdk-context`.
This page documents the domain's QA concepts generally; it does not
claim this repository has executable evidence for them yet.

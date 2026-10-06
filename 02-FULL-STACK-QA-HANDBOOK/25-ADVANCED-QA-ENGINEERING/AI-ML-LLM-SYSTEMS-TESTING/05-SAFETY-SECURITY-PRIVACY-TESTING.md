# Safety, Security, and Privacy Testing for AI Systems

**Executable evidence:** `ai-systems/tests/safety.test.js`,
`ai-systems/lib/safety.js`, `ai-systems/tests/prompt-testing.test.js`
(injection-defense cases), `ai-systems/lib/mock-provider.js`
(`detectInjection`, `INJECTION_PATTERNS`, `REFUSAL_TEXT`).

## Prompt injection defense

`INJECTION_PATTERNS` in `mock-provider.js` matches known jailbreak-style
phrasings ("ignore all previous instructions", "reveal the system
prompt", "you are now in DAN mode", etc.). Testing this has two
mandatory sides, both present in `prompt-testing.test.js` and covered
directly in `detectInjection` unit cases:

- **True positive:** a known pattern is refused (`REFUSAL_TEXT`), not
  obeyed.
- **False-positive avoidance:** a benign prompt using a trigger word in
  an unrelated, harmless sense is **not** falsely refused.

A defense that only proves the first case is incomplete — a detector
tuned only to avoid false negatives, with no check on false positives,
can degrade to refusing normal traffic. Both are asserted here.

## Secret leakage detection

`lib/safety.js`'s `scanForSecrets(text)` matches secret-shaped patterns
(e.g. an AWS-access-key-ID shape, `AKIA` + 16 uppercase-alnum chars) in
model output. Tests use a **synthetic fixture value** explicitly
disclosed as not a real credential — it only matches the SHAPE for
detection-testing purposes, same discipline this repository uses
elsewhere for any test involving credential-shaped data (see
`04-TOOLS-AND-TECH` CI/CD secret-handling notes). A no-false-positive
case (ordinary text with no secret shape) is tested alongside the
positive case.

## PII leakage detection

`scanForPII(text)` detects PII-shaped data (e.g. email addresses) in
model output — the same "an LLM's free-text output is an untrusted
surface" principle as secret detection, applied to personal data instead
of credentials.

## Redaction

`redact(text)` — detected secrets and PII are actually replaced in the
output, not merely flagged. The test explicitly asserts the *real*
values no longer appear in the redacted string (`!redacted.includes(...)`)
and that the redaction markers do (`[REDACTED_EMAIL]`,
`[REDACTED_AWS_ACCESS_KEY]`) — a redaction function that flags but
doesn't replace has a name that overpromises what it does, and this test
would catch that gap.

## Why this matters for LLM-backed systems specifically

A classical system's outputs come from code the team wrote; an LLM's
outputs are generated text that can echo back anything present in its
context window — including secrets or PII that leaked into a prompt or
retrieved document upstream. Scanning and redacting model output is a
last line of defense that doesn't exist in the same form for
non-generative systems, which is why it's tested as its own concern here
rather than folded into general output validation.

## What a production safety pipeline would add on top of this

Real deployments typically layer a moderation API/classifier, rate
limiting on suspicious traffic, audit logging of refused prompts, and
human review escalation. None of that is implemented here — this lab
covers only the detection/redaction logic itself, deterministically.

# Tool Depth vs. Breadth Questions

Answers sourced from `01-SALIM-BURAK-DIGITAL-TWIN/registry/competency-state.yaml`
and `gaps.yaml`. The pattern below repeats for any tool: state what was
actually done professionally, what was built in this repository, and
what the honest gap is — never one flat "X years of experience" claim.

## "Tell me about your Appium experience."

Professional: executed mobile automation and analyzed results in a
real project (see `professional-experience.yaml#pro.mobile.defacto-like`).
Repository: `NOT_PRACTICED` — no real device/emulator infrastructure
exists in this environment, so no Appium code was written here (see
`gaps.yaml#gap.appium.repo-device-evidence`). Gap: building an Appium
framework from scratch, professionally, has not been done (`gaps.yaml#gap.appium.framework-from-scratch`).
That is the honest, three-dimension answer — not "yes, I know Appium."

## "You have Selenium in this repository — do you have professional Selenium experience?"

No. `competency-state.yaml#competency.web.selenium` has no professional
claim (`gaps.yaml#gap.selenium.professional-exposure`). What exists is
real repository practice: a working Page Object Model suite that passes
in CI (`evidence.selenium.ci-verified-run`, `L4_CI_VERIFIED`) but is
documented as sandbox-blocked in some local environments — a real,
disclosed environment split, not a hidden failure.

## "JMeter — did you build a performance framework?"

Professional: real response-time validation experience on a live
project, participating in reviewing results against thresholds — not
authoring the framework itself. Repository: a real `.jmx` plan exists
and runs locally, with a fail-gate wrapper (`run-jmeter.js`) that reads
JTL file content directly, because JMeter's own process exit code does
not reliably reflect internal sample/assertion failures — a fact
rediscovered and reconfirmed multiple times while building this
repository, not assumed.

## "What's the difference between what you know and what you've done at work?"

That is exactly why the competency model has three independent fields.
Example: Docker — `knowledge: WORKING`, `professional: NONE`,
`repository: DOCUMENTED` (Dockerfile and docker-compose exist and are
syntax-valid, but execution was blocked by no daemon being available in
prior build environments — see `gaps.yaml#gap.docker.runtime-depth`).
Collapsing that into "I know Docker" would hide the real picture.

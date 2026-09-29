# Mobile QA

General mobile QA knowledge and strategy — what any mobile QA engineer
needs to know. For Salim's specific professional mobile/multi-country
experience, see
[`03-DOMAINS/04-MOBILE-DIGITAL-PLATFORMS/`](../../03-DOMAINS/04-MOBILE-DIGITAL-PLATFORMS/)
and the Digital Twin's `professional-experience.yaml#pro.mobile.defacto-like`.
This topic is knowledge-base content; that domain page is where the
personal professional claim lives — kept separate per the "one fact,
one owner" rule.

No real device/emulator infrastructure has ever been available in the
environments that built this repository — see
`QA-DEMO-SYSTEM/evidence/PHASE-8-WEB-MOBILE-QA/MOBILE-LEARNING.md` and
`01-SALIM-BURAK-DIGITAL-TWIN/registry/gaps.yaml#gap.appium.repo-device-evidence`.
Everything below is real strategy knowledge, honestly not backed by
this repository's own executable evidence.

## App types and what changes for QA

- **Native** (Swift/Kotlin): full platform API access, platform-specific
  bugs, two codebases to test (unless one platform is deprioritized).
- **Hybrid** (React Native, Flutter): one codebase, but a real
  "bridge" layer between JS/Dart and native code is a genuine extra
  risk surface — a bug can live in the bridge, not just either side.
  `pro.mobile.defacto-like`'s real professional context (Flutter →
  React Native migration) is exactly a hybrid-to-hybrid migration, and
  "feature parity validation" as a formal QA activity exists *because*
  a migration between two hybrid frameworks can silently drop or alter
  behavior the bridge used to handle differently.
- **WebView-based**: effectively testing a website inside a native
  shell — most web QA techniques apply, plus WebView-specific risks
  (a WebView not respecting native back-button behavior, e.g.).

## The Device/OS Matrix Problem

Unlike web QA's "which browsers," mobile QA multiplies OS version ×
device model × screen size × manufacturer OS customization (Samsung's
Android skin behaves differently from stock Android in real,
documented ways). No team tests every combination — the real skill is
picking a matrix that covers the *risk*, not the *inventory*: oldest
supported OS version (deprecated API behavior), newest OS version
(new permission/security model), smallest supported screen (layout
overflow), and any device/OS combination with a known history of
bugs.

## Permissions

Modern mobile OSes ask for permission at the point of use, not at
install — which means a QA matrix needs to cover: grant, deny, "ask
every time," and revoke-after-grant (does the app handle a permission
disappearing mid-session, not just never having it?). This is a real,
common source of production crashes that a test suite only covering
"permission granted" misses entirely.

## Lifecycle States

- **Background/Foreground**: does state survive backgrounding? Does a
  network call in flight when backgrounded resume, retry, or silently
  fail?
- **Kill/Relaunch**: the OS can kill a backgrounded app for memory at
  any time — does relaunch restore session state, or does the user
  have to log in again unexpectedly?
- **Session persistence**: where is the session token stored, and does
  it survive a device restart? (`QA-DEMO-SYSTEM`'s own web frontend
  uses `sessionStorage`, deliberately NOT `localStorage`, specifically
  so a browser restart clears it — see `web-tests/tests/auth-login.spec.js`'s
  "Storage" test. A mobile app's equivalent decision — Keychain/
  Keystore vs. plain storage — is the same category of QA question,
  with higher security stakes since mobile storage is more often
  device-persistent by default.)

## Network Conditions

Offline and poor-network behavior is a first-class mobile QA category
that web QA can mostly ignore: does the app queue actions offline and
sync later, or fail silently? Does a slow connection show a loading
state or appear frozen? Airplane-mode-mid-request is a real, common
bug class.

## Push Notifications and Deep Links

Both cross the app/OS boundary and are easy to under-test: a push
notification's payload needs schema validation exactly like an API
response does (this repository's own `shared/contracts/` pattern for
REST/GraphQL/WebSocket payloads generalizes directly — a push payload
is just another message contract); a deep link needs testing for both
the app-installed and app-not-installed cases, and for malformed/
malicious deep link parameters (an injection-adjacent risk, not just a
routing one).

## Visual and Accessibility Considerations

Pixel-perfect comparison (Figma-vs-rendered) and screenshot-diff
testing generalize from web to mobile with one extra dimension: screen
density (1x/2x/3x) affects what "pixel-perfect" even means. This
repository's own visual regression approach
(`04-TOOLS-AND-TECH/10-VISUAL-AND-DESIGN/README.md`, built for web) is
the same underlying technique `pro.mobile.defacto-like`'s real
professional work applied to mobile (Figma comparison, Python visual
diff) — the tooling differs by platform, the QA principle doesn't.

## Automation Strategy: Appium and Device Farms

Appium automates against the platform's own accessibility tree (not
pixel coordinates), which is why its API resembles Selenium's — same
underlying idea (locate an element semantically, act on it), different
platform. A device farm (BrowserStack App Automate, Firebase Test Lab)
solves the device-matrix problem above by renting real/virtual devices
rather than owning a physical lab — the same tradeoff CI-hosted browser
testing makes for web (see `05-EXECUTABLE-LABS/README.md`'s Selenium
CI-only-pass note, the mobile equivalent of the same "own infrastructure
vs. rented CI infrastructure" tradeoff).

## What this repository can and cannot claim

Knowledge: demonstrated by the content above. Professional practice:
real, in a sanitized context (`pro.mobile.defacto-like`), execution and
result-analysis level, not from-scratch framework authoring (see
`01-SALIM-BURAK-DIGITAL-TWIN/registry/gaps.yaml#gap.appium.framework-from-scratch`).
Repository practice: `NOT_PRACTICED` — no device/emulator lab exists
here, and none is invented to fill this section.

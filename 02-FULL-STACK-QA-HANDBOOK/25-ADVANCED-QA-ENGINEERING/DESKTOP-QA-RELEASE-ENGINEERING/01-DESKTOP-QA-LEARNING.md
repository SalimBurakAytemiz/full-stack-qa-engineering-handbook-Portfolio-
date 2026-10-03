# Desktop QA (LEARNING / DOCUMENTATION-ONLY)

**Why no real test/code exists here.** This repository's QA Demo
System is entirely a web frontend + REST/GraphQL/WebSocket backend
(`QA-DEMO-SYSTEM/backend`, `QA-DEMO-SYSTEM/web-tests`) — it contains no
native desktop application (no Electron, WPF, WinForms, .NET MAUI, Qt,
GTK, or Swing target) and no OS-level UI-automation driver target
(WinAppDriver needs a real Windows app; the macOS Accessibility API
needs a real macOS app). This is the exact same infrastructure-gap
class already documented for Mobile (Phase 8,
`QA-DEMO-SYSTEM/evidence/PHASE-8-WEB-MOBILE-TESTING/MOBILE-LEARNING.md`)
and Appium (Phase 10,
`QA-DEMO-SYSTEM/evidence/PHASE-10-AUTOMATION-LEARNING-LABS/APPIUM-LEARNING.md`):
without a real target application, even attempting an execution would
not produce a real finding — it would only reproduce the same
"authority/resource outside this repository is required" blocker
already documented twice. Unlike the Selenium lab's real driver/browser
version mismatch (a real execution attempt that produced a real,
documented error), a desktop-automation attempt here has no target to
even connect to.

Because this project has no native desktop application, this section
is presented as general desktop-automation knowledge, not a
project-specific Page Object target — the same framing already used
for the Appium section.

---

## Scope Items

| Item | Concept | How it's done in a real environment |
|---|---|---|
| Windows | UI automation for native Windows apps | **WinAppDriver** (Microsoft's own Selenium-protocol-compatible driver) drives Win32/WinForms/WPF/UWP apps via the same `WebDriver` client libraries as Selenium |
| macOS | UI automation for native macOS apps | Apple's **Accessibility API** (`AXUIElement`), typically wrapped by a higher-level tool; Appium's `mac2` driver is the closest Selenium-protocol-compatible option |
| Cross-platform (Electron) | Testing apps built on Chromium + Node.js | **Playwright** and **Spectron**'s successor pattern (Playwright now officially supports Electron) launch the real Electron binary and automate it through Chromium DevTools Protocol — closer to web automation than native desktop automation |
| Cross-platform (other) | Testing Qt/GTK/Java Swing apps | Framework-specific accessibility bridges (Qt Accessibility, Java Access Bridge), each needing its own driver |
| Locators | Finding UI elements | Native accessibility trees (`AutomationId`, `Name`, control type) rather than DOM selectors — the nearest native equivalent to Selenium's `By.id`/`By.cssSelector` |
| Waits | Synchronization | Same conceptual `WebDriverWait`-equivalent pattern as Selenium/Appium — poll until a condition on the accessibility tree is true |
| Page Objects | Maintainable structure | Directly equivalent to the Selenium lab's `LoginPage`/`ProductsPage` pattern — only the locator strategy changes |
| File-system / OS dialogs | Native dialogs (Open/Save, print) | Cannot be automated through the app's own accessibility tree alone; WinAppDriver can attach to the dialog's own window handle, a real additional complexity web/Electron automation never has |
| Installer / packaging testing | Verifying the installed artifact, not just the running app | MSI/NSIS (Windows), `.pkg`/`.dmg` (macOS), AppImage/`.deb` (Linux) — a distinct QA concern from in-app UI automation |
| Auto-update testing | Verifying the app's self-update mechanism | Requires a real update server/channel (e.g. Electron's `autoUpdater` against a real release feed) — conceptually close to this repository's real release-engineering lab's canary/rollback logic, but for client-side binaries instead of server-side traffic |
| CI | Continuous integration | Requires a real Windows/macOS runner with the real target app installed — GitHub Actions' `windows-latest`/`macos-latest` runners support this in a real project, but no such app exists in this repository to install |

---

## Classification

**LEARNING / DOCUMENTATION-ONLY — NOT TESTED — NOT A BLOCKER.**

The justification is identical in kind to Phase 8 (Mobile) and Phase
10 (Appium): a real target application outside this repository's own
scope is required, which is this campaign's own documented stopping
criterion for this class of gap. This is a true infrastructure
boundary, not a skipped effort — see `COMMON-MISTAKES.md` for why
"document the real concepts honestly" is the correct response here,
rather than fabricating a fake desktop app purely to have something to
automate.

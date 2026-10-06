# Common Mistakes (Real Ones, From Building These Labs)

## 1. Almost testing the bug in isolation instead of as a real comparison

The first instinct for the idempotent-consumer lab was to write one test
proving the idempotent consumer applies its side effect once, and call it
done. That alone proves the fix works, but not that the *bug* was real —
a reader has to take "non-idempotent consumers are a problem" on faith.
The lab was built instead to run the **exact same** failure scenario
through both the non-idempotent and idempotent consumer side by side
(`run-distributed-messaging-lab.js`'s check 3), so the real
double-application (`appliedCount=2`) and the real fix
(`appliedCount=1`) are both directly observed from the same input,
differing only in the one line that matters (the dedup check).

## 2. Nearly flagging local workspace packages as a lockfile-integrity violation

A naive version of `lib/lockfile-integrity.js` would have checked "does
every entry with a `resolved` field have an `integrity` field?" Run
against this repository's real `package-lock.json`, that naive rule
would have flagged 4 entries — `node_modules/automation-labs`,
`node_modules/qa-demo-system-api-tests`,
`node_modules/qa-demo-system-backend`, `node_modules/web-tests` — as
missing their integrity hash. A diagnostic look at those exact entries
showed they are this repo's own local npm workspaces, marked `link: true`
by npm itself, symlinked rather than downloaded, and structurally
incapable of ever carrying an integrity hash. The checker was written to
explicitly skip `link: true` entries, and a dedicated test
(`lockfile-integrity.test.js`, test 3) proves this exclusion directly,
not just the detection of a real violation — a checker that only tests
its positive case would have shipped a false positive against the very
repository it runs in.

## 3. Reporting only the flattering audit number

An early draft of the supply-chain-security lab's aggregate runner only
printed the `--omit=dev` (production-only) vulnerability count, which was
`0` — a clean, reassuring number. That would have silently hidden the
real `24` full-graph advisories from anyone reading the output, even
though those 24 are legitimate, disclosed, dev-tooling-only findings. The
runner was changed to print **both** numbers explicitly
(`run-supply-chain-security-lab.js`'s final console output), because a
security report that only shows the number that makes the report look
good is not a security report.

## 4. Almost classifying every schema mismatch as "breaking"

An early version of `checkCompatibility` treated **any** AJV validation
error as breaking, including `additionalProperties` violations. Since the
baseline schema correctly leaves `additionalProperties` at its default
(`true`) specifically so new fields are allowed, this would never have
fired in practice — but relying on that by accident, rather than by an
explicit, tested design choice, would have been fragile against a future
baseline schema that tightened `additionalProperties`. The classification
was written to filter AJV's errors down to only `required` and `type`
keywords, and a dedicated test proves a newly added field is classified
`SAFE_ADDITIVE`, not `BREAKING` — the negative case that would have caught
the naive version.

## 5. Shelling out to a bare `npm` name, which silently assumes Linux

`lib/sbom.js` and `lib/audit.js` both originally called
`execFileSync('npm', ...)` directly. This passed every test and every
CI run in this repository — because this repository's only available
sandbox and CI runner are both Linux, where the real `npm` executable
on `PATH` genuinely is named `npm`. It does not pass on Windows: the
real Windows `npm` on `PATH` is `npm.cmd` (a shell wrapper), and
`execFileSync` without `shell: true` does not consult `PATHEXT` the
way a real shell does, so the call fails with `spawnSync npm ENOENT`.
Unlike the other four mistakes in this file, this one was **not**
caught during the original build — it was found by an independent
Codex review of the finished lab, which is exactly why independent
review exists, and that distinction is kept honest here rather than
rewritten as if it had been self-caught. The fix
(`lib/npm-cli.js`) never calls a bare `npm` name at all: it resolves
npm's own real CLI JavaScript entry point relative to the currently
running Node binary and runs that file directly through
`process.execPath`, the same Node-binary-direct mechanism already
used elsewhere in this repository to avoid exactly this class of
platform-specific `PATH`/shell assumption. See
`automation-labs/supply-chain-security/EXECUTION.md`'s "Run 4" section
for the honest scope of what was and was not verified (no Windows
environment is available to directly observe the fix running there).

## What these five have in common

Each mistake looks, at first glance, like a reasonable simplification:
test the fix alone, trust any `resolved` field, show the reassuring
number, treat any schema mismatch as a problem, assume the one
operating system this repository's sandbox happens to run on is the
only one that matters. In every case the actual fix was to **run the
real comparison** (bug vs. fix, local-workspace vs. real-registry,
full-graph vs. production-only, breaking vs. additive, Windows path
vs. Unix path) rather than describing only one side of it, and to
write the test — or, for the one mistake this repository's own
environment cannot directly test, the clearly-scoped honest
verification — that specifically proves the distinction holds, not
just that the common case works.

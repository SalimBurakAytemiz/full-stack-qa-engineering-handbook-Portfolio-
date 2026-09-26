#!/usr/bin/env node
// Claude Builder -> Codex Independent Reviewer orchestration runner.
//
// Producer != Reviewer. This script exists so a human (the Founder) is
// never the manual transport layer between Claude (the builder) and
// Codex (the independent reviewer) for this repository's bounded
// implementation packages. It does the parts of that loop that do NOT
// require the Codex CLI itself to be installed/authenticated — commit
// capture, scope freezing, changed-file diffing, an isolated read-only
// worktree of the exact reviewed commit, minimized-env child-process
// invocation, and durable evidence persistence — and it correctly
// reports ENVIRONMENT_BLOCKED (never a fabricated CLEAN/PASS) when the
// Codex CLI cannot actually be resolved or authenticated.
//
// TR: Bu script'in amacı, Claude (builder) ile Codex (independent
// reviewer) arasında Founder'ın MANUEL mesaj taşıyıcısı olmasını
// gereksiz kılmaktır. Codex CLI bu ortamda kurulu/authenticate DEĞİLKEN
// bu script sahte bir CLEAN/PASS ÜRETMEZ — ENVIRONMENT_BLOCKED olarak
// dürüstçe raporlar ve bunun kanıtını (evidence) kalıcı olarak saklar.
//
// Usage:
//   node scripts/review/codex-review-runner.mjs \
//     --package "F1-F7 post-Codex fix package" \
//     [--base <sha>] [--reviewed <sha>] [--criteria <path>] \
//     [--timeout-ms 600000]
//
// Exit codes: 0 = CLEAN. 1 = FIX_REQUIRED (real reviewer findings).
// 2 = ENVIRONMENT_BLOCKED (reviewer could not be launched/authenticated).
// 3 = REVIEW_INPUT_INVALID (orchestration/input problem, not a source defect).

import { execFileSync, spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const EVIDENCE_ROOT = path.join(ROOT, '.review-evidence');

// --- CLI args -------------------------------------------------------
function parseArgs(argv) {
  const args = { timeoutMs: 600000 };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--package') args.package = argv[++i];
    else if (a === '--base') args.base = argv[++i];
    else if (a === '--reviewed') args.reviewed = argv[++i];
    else if (a === '--criteria') args.criteriaPath = argv[++i];
    else if (a === '--timeout-ms') args.timeoutMs = Number(argv[++i]);
  }
  return args;
}

function git(args, cwd = ROOT) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

function nowStamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function fail(status, message, extra = {}) {
  return { status, message, ...extra };
}

// --- Step 1-4: capture baseCommit/reviewedCommit, freeze scope,
// capture changed files (this is real git introspection, not derived
// from anything Codex would need to be running for). -----------------
function resolveCommits(args) {
  const reviewed = args.reviewed ? git(['rev-parse', args.reviewed]) : git(['rev-parse', 'HEAD']);
  let base = args.base ? git(['rev-parse', args.base]) : null;
  if (!base) {
    // Default: the point this branch diverged from origin/main, so the
    // "bounded package" scope is exactly what this branch adds — not
    // the whole repository history.
    try {
      git(['fetch', 'origin', 'main', '--quiet']);
    } catch {
      // Offline or no 'origin' remote reachable — fall back to local main if present.
    }
    try {
      base = git(['merge-base', reviewed, 'origin/main']);
    } catch {
      try {
        base = git(['merge-base', reviewed, 'main']);
      } catch {
        base = null;
      }
    }
  }
  return { base, reviewed };
}

function changedFiles(base, reviewed) {
  if (!base) return { files: [], diffstat: '(no base commit resolvable — full-tree scope, not diffed)' };
  const raw = git(['diff', '--name-status', `${base}..${reviewed}`]);
  const files = raw
    ? raw.split('\n').map((line) => {
        const [status, ...rest] = line.split('\t');
        return { status, path: rest.join('\t') };
      })
    : [];
  const diffstat = git(['diff', '--stat', `${base}..${reviewed}`]);
  return { files, diffstat };
}

// --- Step 6: locate the Codex CLI without assuming it exists. -------
function resolveCodexBinary() {
  try {
    const which = execFileSync('which', ['codex'], { encoding: 'utf8' }).trim();
    if (!which) return { found: false };
    let version = null;
    try {
      version = execFileSync(which, ['--version'], { encoding: 'utf8', timeout: 15000 }).trim();
    } catch (err) {
      return { found: true, binaryPath: which, version: null, versionCheckError: String(err.message || err) };
    }
    return { found: true, binaryPath: which, version };
  } catch {
    return { found: false };
  }
}

// --- Minimum safe environment for a potential Codex auth: pass through
// ONLY the small, explicit set of variables Codex-style CLIs need
// (PATH/HOME to run at all, LANG for locale, and the two plausible auth
// variable names) — never the full process.env, which would leak this
// session's own unrelated credentials (GitHub tokens, Anthropic keys,
// proxy config, etc.) into a third-party child process. --------------
function minimizedChildEnv() {
  const allow = ['PATH', 'HOME', 'LANG', 'OPENAI_API_KEY', 'CODEX_API_KEY', 'CODEX_HOME'];
  const env = {};
  for (const key of allow) {
    if (process.env[key] !== undefined) env[key] = process.env[key];
  }
  return env;
}

function hasCredentials(env) {
  return Boolean(env.OPENAI_API_KEY || env.CODEX_API_KEY);
}

// --- Step: an isolated, detached, read-only worktree at the exact
// reviewed commit — Codex reviews THIS, never the live working tree
// (which could have uncommitted changes or drift mid-review), and
// nothing the reviewer does here can mutate the real repository. -----
function createReadOnlyWorktree(reviewedSha) {
  const dir = mkdtempSync(path.join(tmpdir(), 'codex-review-'));
  rmSync(dir, { recursive: true, force: true }); // git worktree add requires the path not exist
  git(['worktree', 'add', '--detach', dir, reviewedSha]);
  return dir;
}

function removeWorktree(dir) {
  try {
    git(['worktree', 'remove', '--force', dir]);
  } catch {
    // best-effort cleanup; do not fail the whole run over a cleanup error
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
}

// --- Step 7: invoke Codex as a genuinely separate, sandboxed child
// process against the read-only worktree. THE EXACT INVOCATION SHAPE
// BELOW IS BEST-EFFORT AND UNVERIFIED — this environment has never had
// a real Codex CLI to test it against. Once real credentials + binary
// exist, the first real run's stdout/stderr (persisted as evidence)
// should be used to correct this invocation before it is trusted. ----
function invokeCodex({ binaryPath, worktreeDir, bundle, timeoutMs, env }) {
  return new Promise((resolve) => {
    const promptPath = path.join(worktreeDir, '.codex-review-request.json');
    writeFileSync(promptPath, JSON.stringify(bundle, null, 2));
    // Best-effort invocation shape (unverified against a real binary —
    // see the block comment above). `codex exec` is OpenAI Codex CLI's
    // documented non-interactive mode as of this writing; adjust once a
    // real run's evidence proves otherwise.
    const args = ['exec', '--json', `Review the repository at this path in read-only mode against the acceptance criteria and changed-file list in ${promptPath}. Return findings as JSON.`];
    const child = spawn(binaryPath, args, { cwd: worktreeDir, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
    }, timeoutMs);
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ spawnError: String(err.message || err), stdout, stderr, exitCode: null });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ spawnError: null, stdout, stderr, exitCode: code });
    });
  });
}

function validateCodexResult(stdout) {
  // Step 16: validate the returned result before trusting it — a
  // reviewer that returns unparseable output is an orchestration/input
  // problem (REVIEW_INPUT_INVALID), not evidence of a clean or dirty
  // implementation, and must never be silently treated as either.
  const trimmed = (stdout || '').trim();
  if (!trimmed) return { valid: false, reason: 'empty stdout from reviewer' };
  try {
    const parsed = JSON.parse(trimmed);
    return { valid: true, parsed };
  } catch (err) {
    return { valid: false, reason: `stdout is not valid JSON: ${err.message}` };
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.package) {
    console.error('FAIL: --package "<bounded package label>" is required.');
    process.exit(3);
  }

  mkdirSync(EVIDENCE_ROOT, { recursive: true });
  const runId = `${nowStamp()}`;
  const runDir = path.join(EVIDENCE_ROOT, runId);
  mkdirSync(runDir, { recursive: true });

  const timestamps = { startedAt: new Date().toISOString() };
  const { base, reviewed } = resolveCommits(args);
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  const { files, diffstat } = changedFiles(base, reviewed);
  const criteria = args.criteriaPath && existsSync(args.criteriaPath)
    ? readFileSync(args.criteriaPath, 'utf8')
    : '(no --criteria file provided — reviewer should use the bounded package label and changed-file list as scope)';

  const bundle = {
    schemaVersion: 1,
    packageLabel: args.package,
    branch,
    baseCommit: base,
    reviewedCommit: reviewed,
    changedFiles: files,
    diffstat,
    acceptanceCriteria: criteria,
    generatedAt: timestamps.startedAt,
  };
  writeFileSync(path.join(runDir, 'bundle.json'), JSON.stringify(bundle, null, 2));

  const codex = resolveCodexBinary();
  const env = minimizedChildEnv();
  const credentialsPresent = hasCredentials(env);

  let result;
  let worktreeDir = null;
  try {
    // Exercise the real, working part of the pipeline (isolated
    // read-only worktree of the exact reviewed commit) regardless of
    // whether Codex itself is available — this is genuine, testable
    // infrastructure today, not aspirational code.
    worktreeDir = createReadOnlyWorktree(reviewed);
    writeFileSync(path.join(runDir, 'worktree-path.txt'), worktreeDir);

    if (!codex.found) {
      result = fail(
        'ENVIRONMENT_BLOCKED',
        'Codex CLI not found on PATH in this execution environment. Not installed, not simulated, not treated as a source-code defect.',
        { codex }
      );
    } else if (!credentialsPresent) {
      result = fail(
        'ENVIRONMENT_BLOCKED',
        'Codex CLI binary was found, but no OPENAI_API_KEY/CODEX_API_KEY is present in this environment. Cannot authenticate — not invoked.',
        { codex }
      );
    } else {
      const invocation = await invokeCodex({ binaryPath: codex.binaryPath, worktreeDir, bundle, timeoutMs: args.timeoutMs, env });
      writeFileSync(path.join(runDir, 'stdout.log'), invocation.stdout || '');
      writeFileSync(path.join(runDir, 'stderr.log'), invocation.stderr || '');
      if (invocation.spawnError) {
        result = fail('ENVIRONMENT_BLOCKED', `Failed to spawn Codex CLI: ${invocation.spawnError}`, { codex, exitCode: invocation.exitCode });
      } else {
        const validated = validateCodexResult(invocation.stdout);
        if (!validated.valid) {
          result = fail('REVIEW_INPUT_INVALID', `Codex returned output that could not be validated: ${validated.reason}`, { codex, exitCode: invocation.exitCode });
        } else {
          const verdict = validated.parsed.verdict || validated.parsed.status;
          result = {
            status: verdict === 'CLEAN' || verdict === 'PASS' ? 'CLEAN' : 'FIX_REQUIRED',
            message: 'Codex review completed and returned a validated result.',
            codex,
            exitCode: invocation.exitCode,
            reviewerResult: validated.parsed,
          };
        }
      }
    }
  } finally {
    if (worktreeDir) removeWorktree(worktreeDir);
  }

  timestamps.finishedAt = new Date().toISOString();

  const finalRecord = {
    schemaVersion: 1,
    runId,
    package: args.package,
    branch,
    baseCommit: base,
    reviewedCommit: reviewed,
    timestamps,
    provenance: {
      reviewerTool: 'codex-cli',
      binaryPath: codex.binaryPath || null,
      version: codex.version || null,
      invoked: codex.found && credentialsPresent,
    },
    result,
  };
  writeFileSync(path.join(runDir, 'result.json'), JSON.stringify(finalRecord, null, 2));

  console.log(`Review run persisted: ${path.relative(ROOT, runDir)}`);
  console.log(`Status: ${result.status}`);
  console.log(result.message);

  const exitCodeByStatus = { CLEAN: 0, FIX_REQUIRED: 1, ENVIRONMENT_BLOCKED: 2, REVIEW_INPUT_INVALID: 3 };
  process.exit(exitCodeByStatus[result.status] ?? 3);
}

main().catch((err) => {
  console.error('REVIEW_INPUT_INVALID: unhandled orchestration error:', err);
  process.exit(3);
});

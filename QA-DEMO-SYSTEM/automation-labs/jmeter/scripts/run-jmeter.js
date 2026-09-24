const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

// Codex fix-campaign B5 (P2, Phase 10) — Fail Gate. Before this file, the
// .jmx plan was invoked with the raw `jmeter -n -t ... -l results.jtl`
// CLI command directly, in evidence and in CI — no wrapper existed at all.
// Stock JMeter's non-GUI runner does NOT reliably set a non-zero process
// exit code just because samples/assertions inside the run failed (a
// well-known JMeter limitation: exit code reflects "did the JVM crash",
// not "did the test pass"). A sample or assertion FAIL (including our
// DurationAssertion threshold, Bölüm 4 of the fix-campaign task) could
// therefore report PASS to any caller checking only `$?`. This script is
// the real fail gate: it runs JMeter, then independently inspects the
// JTL result file it produced and decides pass/fail from the DATA, never
// from JMeter's own process exit code alone.

// Parses a JMeter CSV-format JTL file (produced by this project's
// ResultCollector saveConfig — fieldNames=true, xml=false) into a
// deterministic outcome. Header-driven (finds the "success" column by
// NAME, not by a hardcoded position) so it does not depend on assuming
// an exact JMeter column layout, which this sandbox cannot verify by
// actually running JMeter (see EXECUTION.md — the XStream/libxstream
// incompatibility blocks every non-GUI run here). This function has NO
// dependency on the `jmeter` binary itself — it is pure data parsing,
// which is why it can be (and is) unit-verified with fixture JTL files
// even though the real binary cannot run in this sandbox.
function parseCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

function parseJtl(jtlContent) {
  const lines = jtlContent.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length === 0) {
    return { total: 0, failed: 0, failedRows: [], malformed: true, reason: 'JTL file is empty' };
  }

  const header = parseCsvLine(lines[0]);
  const successIdx = header.indexOf('success');
  const labelIdx = header.indexOf('label');
  const failureMessageIdx = header.indexOf('failureMessage');

  if (successIdx === -1) {
    return { total: 0, failed: 0, failedRows: [], malformed: true, reason: `JTL header has no "success" column: ${header.join(',')}` };
  }

  const rows = lines.slice(1).map((line) => parseCsvLine(line));
  const failedRows = [];
  for (const row of rows) {
    if (row[successIdx] !== 'true') {
      failedRows.push({
        label: labelIdx !== -1 ? row[labelIdx] : '(unknown)',
        failureMessage: failureMessageIdx !== -1 ? row[failureMessageIdx] : '(no failure message column)',
      });
    }
  }

  return { total: rows.length, failed: failedRows.length, failedRows, malformed: false };
}

// FAIL GATE NEDENİ (Codex final fix round B5): stok JMeter'ın kendi
// non-GUI process exit code'u, örneklerin/assertion'ların İÇERDE
// başarısız olup olmadığını GÜVENİLİR şekilde YANSITMAZ — bu ayrım
// AMPİRİK olarak da doğrulandı (bkz. EXECUTION.md): bu sandbox'ta gerçek
// bir JMeter çöküşünde bile (`ForbiddenClassException`) JMeter'ın KENDİ
// exit code'u 0 idi. Bu fonksiyon bu yüzden JMeter'ın exit code'una DEĞİL,
// JTL sonuç dosyasının GERÇEK İÇERİĞİNE bakar — tek güvenilir kaynak
// budur. The gate decision itself, isolated from I/O so it is directly
// testable.
function determineExitCode(outcome) {
  if (outcome.malformed) {
    // An unparseable/missing result file is itself a failure to trust —
    // never silently treated as a pass.
    return 1;
  }
  if (outcome.total === 0) {
    // Zero samples executed is not a pass — it means the run didn't do
    // what it claimed to.
    return 1;
  }
  return outcome.failed > 0 ? 1 : 0;
}

function runJMeter({ planPath, jtlPath, jmeterArgs = [] }) {
  fs.rmSync(jtlPath, { force: true });
  fs.mkdirSync(path.dirname(jtlPath), { recursive: true });

  const args = ['-n', '-t', planPath, '-l', jtlPath, ...jmeterArgs];
  console.log(`[jmeter-fail-gate] running: jmeter ${args.join(' ')}`);
  const result = spawnSync('jmeter', args, { encoding: 'utf-8' });

  if (result.error) {
    console.log(`[jmeter-fail-gate] JMETER_STATUS: LAUNCH_FAILED — ${result.error.message}`);
    process.exitCode = 1;
    return;
  }

  // JMeter's own process exit code is checked too (e.g. a JVM crash, a
  // malformed plan) — but it is a FLOOR, not the whole gate. A JMeter
  // exit code of 0 does NOT by itself mean the JTL shows a pass; the
  // JTL is still inspected below regardless.
  if (result.status !== 0 || !fs.existsSync(jtlPath)) {
    console.log(`[jmeter-fail-gate] JMETER_STATUS: LAUNCH_OR_RUNTIME_ERROR (exit ${result.status})`);
    console.log(result.stdout || '');
    console.log(result.stderr || '');
    process.exitCode = 1;
    return;
  }

  const jtlContent = fs.readFileSync(jtlPath, 'utf-8');
  const outcome = parseJtl(jtlContent);
  const exitCode = determineExitCode(outcome);

  console.log(`[jmeter-fail-gate] JTL_TOTAL_SAMPLES: ${outcome.total}`);
  console.log(`[jmeter-fail-gate] JTL_FAILED_SAMPLES: ${outcome.failed}`);
  for (const row of outcome.failedRows) {
    console.log(`[jmeter-fail-gate]   FAILED: ${row.label} — ${row.failureMessage}`);
  }
  console.log(`[jmeter-fail-gate] GATE_RESULT: ${exitCode === 0 ? 'PASS' : 'FAIL'}`);
  process.exitCode = exitCode;
}

module.exports = { parseJtl, determineExitCode, runJMeter };

if (require.main === module) {
  const planPath = process.env.JMETER_PLAN || path.join(__dirname, '..', 'qa-demo-system-load-test.jmx');
  const jtlPath = process.env.JMETER_JTL || path.join(__dirname, '..', 'results', 'run.jtl');
  const port = process.env.PORT || '4500';
  runJMeter({ planPath, jtlPath, jmeterArgs: [`-Jport=${port}`] });
}

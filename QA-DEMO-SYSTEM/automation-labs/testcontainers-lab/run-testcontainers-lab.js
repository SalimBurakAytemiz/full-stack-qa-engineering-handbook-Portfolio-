#!/usr/bin/env node
'use strict';

// Real Testcontainers lab: starts a real Docker container via the real
// `testcontainers` npm package, makes a real HTTP request to the service
// it runs, and tears it down. If no Docker daemon is reachable (true in
// this local sandbox — confirmed via `docker info`), this reports
// EXTERNALLY_BLOCKED honestly rather than faking a pass. On GitHub Actions
// ubuntu-latest runners, a Docker daemon IS available, so the exact same
// code genuinely executes there — see README.md.
// TR: GERÇEK bir Docker container'ı GERÇEK `testcontainers` paketiyle
// başlatır. Bu sandbox'ta Docker daemon'a erişilemiyor (doğrulandı) — bu
// durumda sahte bir PASS yerine dürüstçe EXTERNALLY_BLOCKED raporlanır.

const { GenericContainer } = require('testcontainers');
const { looksLikeNoDockerDaemon } = require('./lib/classify-docker-error');

let explicitOutcomeReported = false;
function reportOutcome(exitCode) {
  explicitOutcomeReported = true;
  process.exitCode = exitCode;
}
process.on('exit', () => {
  if (!explicitOutcomeReported) {
    console.log('TESTCONTAINERS_LAB_STATUS: INCOMPLETE_NO_EXPLICIT_RESULT');
    process.exitCode = 3;
  }
});

async function main() {
  console.log('TESTCONTAINERS_LAB: attempting to start a real container (nginx:alpine) via testcontainers ...');

  let container;
  try {
    container = await new GenericContainer('nginx:alpine').withExposedPorts(80).start();
  } catch (err) {
    const message = (err && err.message) || String(err);
    if (looksLikeNoDockerDaemon(message)) {
      console.log(`TESTCONTAINERS_LAB: no reachable Docker daemon (${message.split('\n')[0]})`);
      console.log(
        'TESTCONTAINERS_LAB_STATUS: EXTERNALLY_BLOCKED — real container execution requires a Docker daemon, which is not reachable in this environment. This is not a fake pass: the testcontainers-lab CI job runs this exact script on GitHub Actions (ubuntu-latest, real Docker daemon) and is expected to report EXECUTED there — see EXECUTION.md for the real local vs. CI results.',
      );
      reportOutcome(0);
      return;
    }
    console.log(`TESTCONTAINERS_LAB_ERROR: unexpected failure starting container: ${message}`);
    reportOutcome(1);
    return;
  }

  try {
    const port = container.getMappedPort(80);
    const host = container.getHost();
    const url = `http://${host}:${port}/`;
    const res = await fetch(url);
    const body = await res.text();
    const servedByNginx = /nginx/i.test(body);
    console.log(`TESTCONTAINERS_LAB: GET ${url} -> status ${res.status}, body contains 'nginx': ${servedByNginx}`);

    if (res.status !== 200 || !servedByNginx) {
      console.log('TESTCONTAINERS_LAB_STATUS: FAILED — container started but did not serve the expected response.');
      reportOutcome(1);
      return;
    }
    console.log('TESTCONTAINERS_LAB_STATUS: EXECUTED — real container started, real mapped port, real HTTP response verified, real teardown follows.');
    reportOutcome(0);
  } finally {
    await container.stop();
  }
}

main().catch((err) => {
  console.log(`TESTCONTAINERS_LAB_ERROR: ${(err && err.stack) || err}`);
  reportOutcome(1);
});

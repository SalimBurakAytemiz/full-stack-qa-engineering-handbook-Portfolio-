'use strict';

// A real synthetic-monitoring primitive: times a real async check against
// a real running service, classifies it against a disclosed latency
// budget, and never conflates "it failed" with "it was slow" — these are
// two different signals a real production monitor must report
// separately (a slow-but-working endpoint needs a different response
// than a down one).
// TR: Gercek bir sentetik-izleme (synthetic monitoring) temel yapi
// tasi: gercek bir async kontrolu zamanlar, acik bir gecikme butcesine
// karsi siniflandirir — "basarisiz oldu" ile "yavasti" asla
// birbirine karistirilmaz.

/**
 * @param {string} name
 * @param {() => Promise<{ok: boolean, detail?: string}>} checkFn - performs the real check
 * @param {number} budgetMs - the disclosed latency budget for this check
 * @returns {Promise<{name: string, ok: boolean, elapsedMs: number, withinBudget: boolean, verdict: 'PASS'|'SLOW'|'FAIL', detail?: string}>}
 */
async function timedCheck(name, checkFn, budgetMs) {
  const startedAt = Date.now();
  let result;
  try {
    result = await checkFn();
  } catch (err) {
    result = { ok: false, detail: `threw: ${err.message}` };
  }
  const elapsedMs = Date.now() - startedAt;
  const withinBudget = elapsedMs <= budgetMs;

  let verdict;
  if (!result.ok) verdict = 'FAIL';
  else if (!withinBudget) verdict = 'SLOW';
  else verdict = 'PASS';

  return { name, ok: result.ok, elapsedMs, withinBudget, verdict, detail: result.detail };
}

/**
 * @param {Array<{verdict: string}>} results
 * @returns {'GO'|'GO_DEGRADED'|'NO_GO'} the overall synthetic-monitoring verdict
 */
function overallVerdict(results) {
  if (results.some((r) => r.verdict === 'FAIL')) return 'NO_GO';
  if (results.some((r) => r.verdict === 'SLOW')) return 'GO_DEGRADED';
  return 'GO';
}

/**
 * Retries a real check with a real delay between attempts — for
 * transient failures only; a budget-exceeding "SLOW" result is not
 * retried here, since retrying would hide the real latency signal.
 * @param {() => Promise<{ok: boolean, detail?: string}>} checkFn
 * @param {{retries: number, delayMs: number}} options
 */
async function retry(checkFn, { retries, delayMs }) {
  let lastResult;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    lastResult = await checkFn();
    if (lastResult.ok) return lastResult;
    if (attempt < retries) await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return lastResult;
}

module.exports = { timedCheck, overallVerdict, retry };

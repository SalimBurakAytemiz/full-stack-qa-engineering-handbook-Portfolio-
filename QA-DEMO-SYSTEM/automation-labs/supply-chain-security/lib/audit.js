'use strict';

// Real vulnerability audit: shells out to npm's own `npm audit --json`
// and parses the real report. npm audit exits non-zero when it finds
// vulnerabilities, which is a normal result for this command, not a
// failure of this function — so a non-zero exit with valid JSON on
// stdout is treated as success, and only a missing/invalid JSON body
// is treated as a real error.
// TR: Gercek zafiyet taramasi: npm'in kendi `npm audit --json` komutunu
// calistirir. Zafiyet bulununca npm audit sifirdan farkli exit code
// doner; bu normal bir sonuctur, hata degildir.

const { execFileSync } = require('node:child_process');

/**
 * @param {string} cwd - directory to run npm in (the npm workspace root)
 * @param {object} [options]
 * @param {boolean} [options.omitDev] - pass --omit=dev to scope to production deps only
 * @returns {object} the real, parsed npm audit JSON report
 */
function runAudit(cwd, options = {}) {
  const args = ['audit', '--json'];
  if (options.omitDev) args.push('--omit=dev');
  let raw;
  try {
    raw = execFileSync('npm', args, { cwd, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  } catch (err) {
    // TR: npm audit zafiyet buldugunda exit code != 0 doner ama stdout'ta
    // gecerli JSON vardir — bu durumu gercek bir hatadan ayirt ediyoruz.
    if (err.stdout) {
      raw = err.stdout;
    } else {
      throw err;
    }
  }
  return JSON.parse(raw);
}

/**
 * @param {object} auditReport - a parsed npm audit --json report
 * @returns {string[]} the package names npm audit flagged as vulnerable
 */
function listVulnerablePackageNames(auditReport) {
  return Object.keys(auditReport.vulnerabilities || {});
}

module.exports = { runAudit, listVulnerablePackageNames };

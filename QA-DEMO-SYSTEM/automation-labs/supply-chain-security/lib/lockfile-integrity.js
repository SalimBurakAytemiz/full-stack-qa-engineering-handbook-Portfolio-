'use strict';

// Real lockfile-integrity check against the actual package-lock.json
// structure (lockfileVersion 3). Every entry resolved from a real external
// registry URL must carry an `integrity` SRI hash — that hash is what npm
// verifies the downloaded tarball against, and its absence is a genuine
// supply-chain gap (a compromised registry or MITM could substitute a
// different tarball at install time with nothing to catch it).
//
// Local workspace packages (this repo's own `backend`, `api-tests`,
// `web-tests`, `automation-labs`) are symlinked, not downloaded, and npm
// marks them with `link: true` and a non-URL `resolved` value (e.g.
// "backend"). They never carry `integrity` and never can — that is not a
// gap, so this checker must not flag them.
// TR: Gercek lockfile butunluk kontrolu. Gercek bir harici registry'den
// cozulmus her girdi bir `integrity` SRI hash'i tasimalidir; bunun eksik
// olmasi gercek bir tedarik zinciri boslugudur. Yerel workspace paketleri
// (link: true) sembolik baglantidir, indirilmez — integrity eksikligi
// burada bir bulgu DEGILDIR.

/**
 * @param {object} lockfileDoc - parsed package-lock.json
 * @returns {{checked: number, violations: Array<{path: string, resolved: string}>, excludedLocalWorkspaces: string[]}}
 */
function checkLockfileIntegrity(lockfileDoc) {
  const packages = lockfileDoc.packages || {};
  const violations = [];
  const excludedLocalWorkspaces = [];
  let checked = 0;

  for (const [pkgPath, entry] of Object.entries(packages)) {
    if (pkgPath === '') continue; // the root package itself, not a dependency
    if (!entry.resolved) continue; // no resolved target to verify at all

    if (entry.link === true) {
      // TR: Yerel workspace sembolik baglantisi — bulgu disi.
      excludedLocalWorkspaces.push(pkgPath);
      continue;
    }

    const isRealRegistryUrl = /^https?:\/\//.test(entry.resolved);
    if (!isRealRegistryUrl) continue; // not an externally-fetched package

    checked += 1;
    if (!entry.integrity) {
      violations.push({ path: pkgPath, resolved: entry.resolved });
    }
  }

  return { checked, violations, excludedLocalWorkspaces };
}

module.exports = { checkLockfileIntegrity };

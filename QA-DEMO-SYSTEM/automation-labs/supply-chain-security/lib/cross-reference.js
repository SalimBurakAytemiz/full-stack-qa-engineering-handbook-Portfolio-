'use strict';

// Real cross-reference: checks whether every package npm audit flags as
// vulnerable is actually traceable in a given SBOM's component list.
// A vulnerable package that is MISSING from the SBOM is a real supply-chain
// visibility gap (you cannot govern what you cannot see). A vulnerable
// package that is simply absent because it is dev-only (and the SBOM was
// scoped to a production workspace) is expected and reported as such, not
// as a gap.
// TR: npm audit'in zafiyetli isaretledigi her paketin, verilen SBOM'un
// bilesen listesinde gercekten izlenebilir olup olmadigini kontrol eder.

/**
 * @param {string[]} vulnerablePackageNames - from audit.listVulnerablePackageNames()
 * @param {string[]} sbomComponentNames - from sbom.listComponentNames()
 * @returns {{tracedInSbom: string[], notInSbom: string[]}}
 */
function crossReferenceVulnerabilitiesWithSbom(vulnerablePackageNames, sbomComponentNames) {
  const sbomSet = new Set(sbomComponentNames);
  const tracedInSbom = [];
  const notInSbom = [];
  for (const name of vulnerablePackageNames) {
    if (sbomSet.has(name)) tracedInSbom.push(name);
    else notInSbom.push(name);
  }
  return { tracedInSbom, notInSbom };
}

module.exports = { crossReferenceVulnerabilitiesWithSbom };

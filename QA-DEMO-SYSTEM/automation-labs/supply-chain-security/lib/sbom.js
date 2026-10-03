'use strict';

// Real SBOM generation: shells out to npm's own built-in `npm sbom` command
// (no added dependency) and parses the real CycloneDX JSON it prints.
// TR: Gercek SBOM uretimi: npm'in kendi `npm sbom` komutunu calistirir
// (ek bir bagimlilik eklenmez), gercek CycloneDX JSON ciktisini parse eder.

const { execFileSync } = require('node:child_process');

/**
 * @param {string} workspaceName - e.g. "backend"
 * @param {string} cwd - directory to run npm in (the npm workspace root)
 * @returns {object} the real, parsed CycloneDX SBOM document
 */
function generateSbom(workspaceName, cwd) {
  const raw = execFileSync(
    'npm',
    ['sbom', '--sbom-format', 'cyclonedx', '--workspace', workspaceName],
    { cwd, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
  );
  const doc = JSON.parse(raw);
  if (doc.bomFormat !== 'CycloneDX') {
    throw new Error(`expected a CycloneDX document, got bomFormat=${doc.bomFormat}`);
  }
  return doc;
}

/**
 * @param {object} sbomDoc - a parsed CycloneDX document from generateSbom()
 * @returns {string[]} the package names of every component listed in the SBOM
 */
function listComponentNames(sbomDoc) {
  return (sbomDoc.components || []).map((c) => c.name);
}

module.exports = { generateSbom, listComponentNames };

'use strict';

// A real, platform-safe way to launch npm's own CLI — never a bare
// "npm" executable name. On Windows, execFileSync('npm', ...) fails
// with "spawnSync npm ENOENT" without shell:true, because "npm" on
// Windows is actually "npm.cmd" (a shell script), and execFileSync
// does not consult PATHEXT the way a real shell would. Using
// shell:true would work but ties the launch to shell-specific
// quoting/escaping behavior. The genuinely cross-platform fix used
// here: locate npm's own real JavaScript CLI entry point
// (npm-cli.js) relative to the currently running Node binary
// (process.execPath — the same Node process already executing this
// code), and run THAT directly through process.execPath, exactly as
// "node <script.js>" already works identically on every platform.
// No .cmd/.bat file is ever launched, so there is nothing for
// shell:true to work around.
// TR: npm'in kendi CLI'sini gercek, platform-guvenli bir sekilde
// baslatir — asla cıplak bir "npm" calistirilabilir adi kullanmaz.
// Windows'ta execFileSync('npm', ...) shell:true olmadan "spawnSync
// npm ENOENT" ile basarisiz olur, cunku Windows'ta "npm" aslinda
// "npm.cmd" (bir shell betigi)dir. Burdaki gercek cozum: npm'in kendi
// gercek JavaScript CLI giris noktasini (npm-cli.js), su an calisan
// Node ikili dosyasina (process.execPath) gore bulmak ve onu
// process.execPath araciligiyla DOGRUDAN calistirmaktir.

const path = require('node:path');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

function resolveNpmCliEntry() {
  const nodeBinDir = path.dirname(process.execPath);
  const candidates = [
    // Windows layout: npm ships directly alongside node.exe.
    path.join(nodeBinDir, 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    // Unix layout (Linux/macOS): npm ships under <prefix>/lib/node_modules.
    path.join(nodeBinDir, '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `could not locate npm's own CLI entry (npm-cli.js) relative to the running Node binary (${process.execPath}); tried: ${candidates.join(', ')}`
  );
}

/**
 * Runs `npm <args>` by executing npm's own real CLI JS file through
 * the current Node binary — never a bare "npm"/"npm.cmd" lookup.
 * @param {string[]} args - npm subcommand and flags, e.g. ['audit', '--json']
 * @param {object} execOptions - passed through to execFileSync (cwd, encoding, maxBuffer, ...)
 * @returns {string} the real stdout npm produced
 */
function runNpmCli(args, execOptions) {
  const npmCliEntry = resolveNpmCliEntry();
  return execFileSync(process.execPath, [npmCliEntry, ...args], execOptions);
}

module.exports = { resolveNpmCliEntry, runNpmCli };

'use strict';

// A real, hand-rolled semver (semver.org 2.0.0) parser/comparator —
// not a wrapper around the npm `semver` package. Deliberately
// dependency-free, the same choice this repository already made for
// i18n-testing (Node's own Intl) and modern-protocols (Node's own
// http): parsing and comparing MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
// correctly is a small, fully-specified, independently-testable piece
// of logic, so it does not need a dependency.
// TR: Bu npm'in `semver` paketinin bir sarmalayıcısı DEĞİL, GERÇEK,
// elle yazılmış bir semver ayrıştırıcı/karşılaştırıcıdır — bu repodaki
// "gerekmeyen bağımlılık eklemeyin" ilkesiyle aynı tercih.

const SEMVER_RE =
  /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-.]+))?(?:\+([0-9A-Za-z-.]+))?$/;

function parse(version) {
  const match = SEMVER_RE.exec(String(version).trim());
  if (!match) {
    return null;
  }
  const [, major, minor, patch, prerelease, build] = match;
  return {
    major: Number(major),
    minor: Number(minor),
    patch: Number(patch),
    prerelease: prerelease ? prerelease.split('.') : [],
    build: build ? build.split('.') : [],
    raw: version,
  };
}

function isValid(version) {
  return parse(version) !== null;
}

function comparePrereleaseIdentifier(a, b) {
  const aNum = /^\d+$/.test(a);
  const bNum = /^\d+$/.test(b);
  if (aNum && bNum) {
    // Numeric identifiers compare numerically (spec clause 11.4.1).
    return Number(a) - Number(b);
  }
  if (aNum !== bNum) {
    // Numeric identifiers always have lower precedence than
    // alphanumeric ones (spec clause 11.4.3).
    return aNum ? -1 : 1;
  }
  return a < b ? -1 : a > b ? 1 : 0;
}

// Returns -1 / 0 / 1. Build metadata is explicitly ignored for
// precedence, exactly as semver.org clause 10 requires — this is a
// deliberate rule, not an oversight, and compare.test.js asserts it.
function compare(versionA, versionB) {
  const a = parse(versionA);
  const b = parse(versionB);
  if (!a || !b) {
    throw new TypeError('compare() requires two valid semver strings');
  }
  if (a.major !== b.major) return a.major < b.major ? -1 : 1;
  if (a.minor !== b.minor) return a.minor < b.minor ? -1 : 1;
  if (a.patch !== b.patch) return a.patch < b.patch ? -1 : 1;

  // A version with a prerelease has LOWER precedence than the same
  // version without one (1.0.0-alpha < 1.0.0) — spec clause 11.3.
  if (a.prerelease.length === 0 && b.prerelease.length === 0) return 0;
  if (a.prerelease.length === 0) return 1;
  if (b.prerelease.length === 0) return -1;

  const len = Math.max(a.prerelease.length, b.prerelease.length);
  for (let i = 0; i < len; i += 1) {
    if (i >= a.prerelease.length) return -1;
    if (i >= b.prerelease.length) return 1;
    const cmp = comparePrereleaseIdentifier(a.prerelease[i], b.prerelease[i]);
    if (cmp !== 0) return cmp < 0 ? -1 : 1;
  }
  return 0;
}

// Classifies the bump from `fromVersion` to `toVersion` by the real
// field that changed — a plain structural comparison, deliberately
// with no special-cased "pre-1.0" category. (An earlier draft of this
// function invented a MINOR_PRE_1_0 category and got its own
// condition wrong — caught by semver.test.js asserting the real
// classifyBump('0.1.0', '0.2.0') result, which is a genuine MINOR
// bump by field comparison, not a disguised major change. See
// isUnstableApi() below for the real, separate SemVer clause 4 signal
// that a 0.1.0 -> 0.2.0 bump still deserves.)
function classifyBump(fromVersion, toVersion) {
  const from = parse(fromVersion);
  const to = parse(toVersion);
  if (!from || !to) {
    throw new TypeError('classifyBump() requires two valid semver strings');
  }
  const cmp = compare(fromVersion, toVersion);
  if (cmp === 0) return 'SAME';
  if (cmp > 0) return 'DOWNGRADE';
  if (from.major !== to.major) return 'MAJOR';
  if (from.minor !== to.minor) return 'MINOR';
  if (from.patch !== to.patch) return 'PATCH';
  return 'PRERELEASE';
}

// SemVer clause 4: "Major version zero (0.y.z) is for initial
// development. Anything MAY change at any time. The public API
// SHOULD NOT be considered stable." A real release-engineering check
// should surface this honestly rather than silently treating a 0.x
// package's MINOR/PATCH distinction as carrying the same stability
// guarantee it would above 1.0.0.
function isUnstableApi(version) {
  const v = parse(version);
  if (!v) {
    throw new TypeError('isUnstableApi() requires a valid semver string');
  }
  return v.major === 0;
}

module.exports = { parse, isValid, compare, classifyBump, isUnstableApi };

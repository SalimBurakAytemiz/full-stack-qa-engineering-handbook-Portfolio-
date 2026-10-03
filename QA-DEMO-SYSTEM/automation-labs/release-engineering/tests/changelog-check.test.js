'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { checkChangelog, parseHeadings } = require('../lib/changelog-check');

const CLEAN_CHANGELOG = `# Changelog

## [Unreleased]

### Added

- a thing

## [2.0.0]

### Changed

- a breaking thing

## [1.0.0]

### Added

- the first thing

## Prior history

Some narrative text about pre-changelog history.
`;

test('parseHeadings() classifies Unreleased/Version/Other headings correctly', () => {
  const headings = parseHeadings(CLEAN_CHANGELOG);
  assert.deepEqual(
    headings.map((h) => h.kind),
    ['UNRELEASED', 'VERSION', 'VERSION', 'OTHER'],
  );
  assert.equal(headings[1].version, '2.0.0');
  assert.equal(headings[2].version, '1.0.0');
});

test('checkChangelog() passes a well-formed changelog with no violations', () => {
  const result = checkChangelog(CLEAN_CHANGELOG);
  assert.equal(result.ok, true);
  assert.deepEqual(result.violations, []);
});

test('checkChangelog() flags version headings that are not in strictly descending order', () => {
  const broken = CLEAN_CHANGELOG.replace('## [2.0.0]', '## [0.5.0]');
  const result = checkChangelog(broken);
  assert.equal(result.ok, false);
  assert.ok(result.violations.some((v) => v.rule === 'VERSION_ORDER'));
});

test('checkChangelog() flags an Unreleased heading placed after a released version', () => {
  const broken = `# Changelog

## [1.0.0]

### Added

- x

## [Unreleased]

### Added

- y
`;
  const result = checkChangelog(broken);
  assert.equal(result.ok, false);
  assert.ok(result.violations.some((v) => v.rule === 'UNRELEASED_AFTER_VERSION'));
});

test('checkChangelog() flags a narrative heading interleaved before version history ends', () => {
  const broken = `# Changelog

## [Unreleased]

### Added

- x

## Some narrative section

## [1.0.0]

### Added

- y
`;
  const result = checkChangelog(broken);
  assert.equal(result.ok, false);
  assert.ok(result.violations.some((v) => v.rule === 'OTHER_HEADING_OUT_OF_PLACE'));
});

test('checkChangelog() flags a subsection name outside the recognized category set', () => {
  const broken = CLEAN_CHANGELOG.replace('### Added\n\n- a thing', '### Stuff\n\n- a thing');
  const result = checkChangelog(broken);
  assert.equal(result.ok, false);
  assert.ok(result.violations.some((v) => v.rule === 'UNKNOWN_SUBSECTION'));
});

test('checkChangelog() allows multiple Unreleased headings as long as all precede released versions', () => {
  // This is the repository's own real CHANGELOG.md shape: two
  // [Unreleased] sections (one per historical campaign), both above
  // any released version — a legitimate pattern, not a violation.
  const multi = `# Changelog

## [Unreleased] — Batch A

### Added

- x

## [Unreleased] — Batch B

### Fixed

- y

## Prior history
`;
  const result = checkChangelog(multi);
  assert.equal(result.ok, true);
});

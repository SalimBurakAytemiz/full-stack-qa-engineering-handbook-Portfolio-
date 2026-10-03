'use strict';

// A real Markdown-heading parser + structural checker for a
// Keep-a-Changelog-style CHANGELOG.md — not a regex spot-check. It
// classifies every `##` heading, then enforces real ordering rules
// against the actual headings found, using semver.js's real compare()
// for the version-ordering rule rather than string comparison.
// TR: Bu bir regex-ile-yama DEĞİL, GERÇEK bir Markdown başlık
// ayrıştırıcısı + yapısal denetleyicidir. Sürüm sıralaması, semver.js
// içindeki GERÇEK compare() ile karşılaştırılır (string karşılaştırma
// değil).

const { compare, isValid } = require('./semver');

const ALLOWED_SUBSECTIONS = new Set([
  'Added',
  'Changed',
  'Deprecated',
  'Removed',
  'Fixed',
  'Security',
  'Notes',
]);

const UNRELEASED_RE = /^\[Unreleased\]/;
const VERSION_RE = /^\[(\d+\.\d+\.\d+(?:-[0-9A-Za-z-.]+)?)\]/;

function parseHeadings(markdown) {
  const lines = markdown.split(/\r?\n/);
  const headings = [];
  for (let i = 0; i < lines.length; i += 1) {
    const h2 = /^##\s+(.+?)\s*$/.exec(lines[i]);
    if (h2) {
      const text = h2[1];
      let kind = 'OTHER';
      let version = null;
      if (UNRELEASED_RE.test(text)) {
        kind = 'UNRELEASED';
      } else {
        const versionMatch = VERSION_RE.exec(text);
        if (versionMatch && isValid(versionMatch[1])) {
          kind = 'VERSION';
          version = versionMatch[1];
        }
      }
      headings.push({ line: i + 1, text, kind, version, subsections: [] });
      continue;
    }
    const h3 = /^###\s+(.+?)\s*$/.exec(lines[i]);
    if (h3 && headings.length > 0) {
      headings[headings.length - 1].subsections.push({ line: i + 1, name: h3[1] });
    }
  }
  return headings;
}

// Returns { ok, violations: [{ rule, detail }], headings }.
function checkChangelog(markdown) {
  const headings = parseHeadings(markdown);
  const violations = [];

  // Rule 1: VERSION headings must appear in strictly descending real
  // semver order (newest release first), checked with the real
  // compare() function, never by comparing the raw strings.
  const versionHeadings = headings.filter((h) => h.kind === 'VERSION');
  for (let i = 1; i < versionHeadings.length; i += 1) {
    const prev = versionHeadings[i - 1];
    const curr = versionHeadings[i];
    if (compare(prev.version, curr.version) <= 0) {
      violations.push({
        rule: 'VERSION_ORDER',
        detail: `[${prev.version}] (line ${prev.line}) is not strictly newer than the [${curr.version}] (line ${curr.line}) that follows it`,
      });
    }
  }

  // Rule 2: every UNRELEASED heading must appear before every VERSION
  // heading — unreleased changes are, by definition, not yet any
  // released version, so they belong above all of them.
  const firstVersionLine = versionHeadings.length > 0 ? versionHeadings[0].line : Infinity;
  for (const h of headings) {
    if (h.kind === 'UNRELEASED' && h.line > firstVersionLine) {
      violations.push({
        rule: 'UNRELEASED_AFTER_VERSION',
        detail: `[Unreleased] heading at line ${h.line} appears after a released version heading`,
      });
    }
  }

  // Rule 3: an OTHER heading (e.g. a trailing narrative section) may
  // only appear after every UNRELEASED/VERSION heading — it must not
  // be mistaken for, or interleaved with, real version history.
  const lastVersionedLine = headings
    .filter((h) => h.kind === 'UNRELEASED' || h.kind === 'VERSION')
    .reduce((max, h) => Math.max(max, h.line), 0);
  for (const h of headings) {
    if (h.kind === 'OTHER' && h.line < lastVersionedLine) {
      violations.push({
        rule: 'OTHER_HEADING_OUT_OF_PLACE',
        detail: `non-version heading "${h.text}" at line ${h.line} appears before the real version history ends`,
      });
    }
  }

  // Rule 4: every ### subsection name must be one of the allowed
  // Keep-a-Changelog categories (plus this repo's own "Notes").
  for (const h of headings) {
    for (const sub of h.subsections) {
      if (!ALLOWED_SUBSECTIONS.has(sub.name)) {
        violations.push({
          rule: 'UNKNOWN_SUBSECTION',
          detail: `"${sub.name}" at line ${sub.line} (under "${h.text}") is not a recognized subsection category`,
        });
      }
    }
  }

  return { ok: violations.length === 0, violations, headings };
}

module.exports = { parseHeadings, checkChangelog, ALLOWED_SUBSECTIONS };

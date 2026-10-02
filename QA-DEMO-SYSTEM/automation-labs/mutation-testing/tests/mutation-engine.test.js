'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { generateMutants, MUTATORS } = require('../lib/mutate');

const TARGET_PATH = path.join(__dirname, '..', '..', '..', 'backend', 'src', 'services', 'products.service.js');

test('generateMutants produces exactly one entry per declared mutator', () => {
  const source = fs.readFileSync(TARGET_PATH, 'utf8');
  const mutants = generateMutants(source);
  assert.equal(mutants.length, MUTATORS.length);
});

test('every generated (non-skipped) mutant source differs from the original', () => {
  const source = fs.readFileSync(TARGET_PATH, 'utf8');
  const mutants = generateMutants(source);
  const generated = mutants.filter((m) => m.status === 'GENERATED');
  assert.ok(generated.length > 0, 'at least one mutator must find its target pattern in the real file');
  for (const m of generated) {
    assert.notEqual(m.mutatedSource, source, `mutant ${m.id} must actually differ from the original source`);
  }
});

test('a mutator whose target pattern does not exist is reported SKIPPED, never silently dropped', () => {
  const mutants = generateMutants('function noop() { return 1; }');
  assert.equal(mutants.length, MUTATORS.length);
  assert.ok(mutants.every((m) => m.status === 'SKIPPED_PATTERN_NOT_FOUND'));
  assert.ok(mutants.every((m) => m.mutatedSource === null));
});

test('every generated mutant source remains syntactically valid JavaScript', () => {
  const source = fs.readFileSync(TARGET_PATH, 'utf8');
  const mutants = generateMutants(source);
  for (const m of mutants) {
    if (m.status === 'SKIPPED_PATTERN_NOT_FOUND') continue;
    assert.doesNotThrow(() => new vm.Script(m.mutatedSource), `mutant ${m.id} must remain syntactically valid`);
  }
});

test('mutating the real target file does not mutate the file on disk', () => {
  const before = fs.readFileSync(TARGET_PATH, 'utf8');
  generateMutants(before);
  const after = fs.readFileSync(TARGET_PATH, 'utf8');
  assert.equal(before, after, 'generateMutants must never write to the real target file');
});

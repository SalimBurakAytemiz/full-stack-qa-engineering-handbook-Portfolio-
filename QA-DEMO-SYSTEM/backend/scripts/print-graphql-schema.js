#!/usr/bin/env node
// Regenerates the canonical GraphQL contract snapshot from the real,
// running schema (src/graphql/schema.js) — never hand-edited. Run this
// deliberately after an intentional schema change, then commit the
// diff; `tests/graphql-contract-drift.test.js` fails the suite if the
// two ever go out of sync without that deliberate step.
//
// TR: Bu script'in çıktısı ELLE düzenlenmez — kaynak GERÇEK şemadır
// (src/graphql/schema.js). Amaç, GraphQL şemasındaki kırıcı bir
// değişikliğin sessizce (yalnızca bir test assertion'ında) fark
// edilmesini değil, tek bir okunabilir dosya diff'inde görünür
// olmasını sağlamaktır.

const path = require('node:path');
const fs = require('node:fs');
const { printSchema } = require('graphql');
const { schema } = require('../src/graphql/schema');

const OUT_PATH = path.join(__dirname, '..', '..', '..', 'shared', 'contracts', 'graphql', 'schema.graphql');

fs.writeFileSync(OUT_PATH, printSchema(schema) + '\n');
console.log(`Wrote ${path.relative(process.cwd(), OUT_PATH)}`);

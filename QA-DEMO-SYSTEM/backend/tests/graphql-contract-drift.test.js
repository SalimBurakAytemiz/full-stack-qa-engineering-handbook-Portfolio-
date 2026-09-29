const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { printSchema } = require('graphql');
const { schema } = require('../src/graphql/schema');

// TR: GraphQL şemasındaki kırıcı değişikliklerin test kapsamından
// sessizce kaçmasını engeller. `graphql.test.js` fonksiyonel davranışı
// test eder ama bir alan/tip SESSİZCE değişse (örn. bir alan Int'ten
// String'e dönse) fonksiyonel testler yine de yeşil kalabilir. Bu test
// GERÇEK şemayı `shared/contracts/graphql/schema.graphql`'daki
// CANONICAL kopyayla birebir karşılaştırır — bir fark varsa, bu
// KASITLI bir kontrat değişikliği midir yoksa kazara mı, insan/inceleme
// kararını gerektirir; sessizce geçmez.
const CONTRACT_PATH = path.join(__dirname, '..', '..', '..', 'shared', 'contracts', 'graphql', 'schema.graphql');

// TR: Codex post-audit fix (P2-02) — Windows'ta (veya CRLF'e normalize eden
// herhangi bir git ayarında) checkout edilen schema.graphql dosyası CRLF
// satır sonlarına sahip olabilir, ancak `printSchema()` her zaman LF üretir
// — bu, hiçbir GERÇEK içerik farkı olmadan bu testin sahte (false-positive)
// FAIL vermesine yol açardı. Karşılaştırmadan ÖNCE her iki tarafı da LF'ye
// normalize ediyoruz; bu yalnızca EOL temsilini eşitler, gerçek içerik
// farkını (bir alan/tip değişikliği gibi) GİZLEMEZ — o fark normalize
// sonrası hâlâ farklı metin üretir.
function normalizeEol(text) {
  return text.replace(/\r\n/g, '\n');
}

test('GraphQL schema contract drift: the real schema matches the committed canonical snapshot', () => {
  const actual = normalizeEol(printSchema(schema) + '\n');
  const canonical = normalizeEol(fs.readFileSync(CONTRACT_PATH, 'utf8'));

  assert.equal(
    actual,
    canonical,
    'The real GraphQL schema (src/graphql/schema.js) no longer matches ' +
      'shared/contracts/graphql/schema.graphql. If this change is intentional, ' +
      'regenerate the snapshot with `node scripts/print-graphql-schema.js` and ' +
      'commit the diff for review — do not edit the snapshot by hand. ' +
      '(Comparison is EOL-normalized — this is real content drift, not a line-ending difference.)'
  );
});

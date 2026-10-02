'use strict';

// A minimal, text-based mutation generator — NOT an AST-based engine like
// Stryker. Each mutator is an exact find/replace pair targeting a known
// substring of the real target source. If the substring is not found (e.g.
// the real file changed shape since this was written), the mutator is
// reported as SKIPPED rather than silently producing nothing — mutation
// testing is only meaningful when every mutator's assumption is checked.
// TR: Bu, Stryker gibi AST tabanlı gerçek bir mutation engine DEĞİLDİR —
// basit, denetlenebilir, metin tabanlı arama/değiştirme kurallarıdır.
// Hedef metin değişirse mutator'ın SESSİZCE hiçbir şey üretmemesi yerine
// SKIPPED olarak raporlanması gerekir.

const MUTATORS = [
  {
    id: 'ROR-boundary-gte',
    description:
      'row.stock_quantity > 0 -> row.stock_quantity >= 0 (relational operator replacement, always-true boundary)',
    find: 'row.stock_quantity > 0',
    replace: 'row.stock_quantity >= 0',
  },
  {
    id: 'ROR-invert',
    description: 'row.stock_quantity > 0 -> row.stock_quantity < 0 (relational operator replacement, inverted)',
    find: 'row.stock_quantity > 0',
    replace: 'row.stock_quantity < 0',
  },
  {
    id: 'ROR-offbyone',
    description: 'row.stock_quantity > 0 -> row.stock_quantity > 1 (boundary off-by-one)',
    find: 'row.stock_quantity > 0',
    replace: 'row.stock_quantity > 1',
  },
  {
    id: 'return-value-undefined-to-null',
    description: 'toApiShape(row) : undefined; -> toApiShape(row) : null; (return-value mutation)',
    find: 'toApiShape(row) : undefined;',
    replace: 'toApiShape(row) : null;',
  },
  {
    id: 'conditional-negation',
    description: 'return row ? toApiShape(row) -> return !row ? toApiShape(row) (ternary condition negation)',
    find: 'return row ? toApiShape(row)',
    replace: 'return !row ? toApiShape(row)',
  },
  {
    id: 'sql-order-by-removed',
    description: "FROM products ORDER BY id -> FROM products (SQL clause deletion in listProducts)",
    find: 'FROM products ORDER BY id',
    replace: 'FROM products',
  },
];

function generateMutants(sourceText) {
  const mutants = [];
  for (const m of MUTATORS) {
    const occurrences = sourceText.split(m.find).length - 1;
    if (occurrences === 0) {
      mutants.push({ id: m.id, description: m.description, status: 'SKIPPED_PATTERN_NOT_FOUND', mutatedSource: null });
      continue;
    }
    // Deliberate: replace only the first occurrence, so each mutant is a
    // single, minimal, independently-attributable change.
    const mutatedSource = sourceText.replace(m.find, m.replace);
    mutants.push({ id: m.id, description: m.description, status: 'GENERATED', mutatedSource });
  }
  return mutants;
}

module.exports = { generateMutants, MUTATORS };

// Shared parser for 01-SALIM-BURAK-DIGITAL-TWIN/02-COMPETENCY-MATRIX.md's
// hand-authored table, used by validate-registry.mjs's competency-matrix
// sync check (Codex final-verification fix, R1-10: "add a regression/check
// so generated/current personal views cannot silently disagree with
// canonical state again").
// TR: Bu dosya, 02-COMPETENCY-MATRIX.md'nin markdown tablosunu ayrıştırır
// — bu tablo generate EDİLMEZ (elle yazılır, dosyanın kendi başında
// "authored to match competency-state.yaml exactly" der), bu yüzden
// generated-output-drift kontrolü gibi bire bir diff mümkün değildir.
// Bunun yerine, her satır SEMANTİK olarak canonical competency-state.yaml
// ile karşılaştırılır (bkz. validate-registry.mjs'deki çağıran kod).

/** Parses the `| Competency | Knowledge | Professional | Repository |` table. */
export function parseCompetencyMatrixTable(markdown) {
  const lines = markdown.split('\n');
  const rows = [];
  let inTable = false;
  for (const line of lines) {
    if (/^\|\s*Competency\s*\|/i.test(line)) {
      inTable = true;
      continue;
    }
    if (!inTable) continue;
    if (/^\|\s*-+\s*\|/.test(line)) continue; // header separator row
    if (!line.startsWith('|')) break; // table ended
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 4) continue;
    rows.push({ label: cells[0], knowledge: cells[1], professional: cells[2], repository: cells[3] });
  }
  return rows;
}

// Naive singular/plural fold (e.g. "events" <-> "event") so wording
// differences between the canonical label and the matrix's hand-authored
// prose ("WebSocket / Realtime Event Testing" vs "WebSocket / realtime
// events") do not produce a false "no matching row" failure — this is
// NOT a stemmer, it only strips a trailing 's' on words long enough that
// doing so is safe (avoids mangling short technical tokens like "aws").
function foldPlural(word) {
  if (word.length > 4 && word.endsWith('s') && !word.endsWith('ss')) {
    return word.slice(0, -1);
  }
  return word;
}

/** Lowercases, strips parenthetical content, and reduces to a word set. */
export function labelWordSet(label) {
  const stripped = label.replace(/\([^)]*\)/g, ' ');
  const words = stripped.toLowerCase().match(/[a-z0-9]+/g) || [];
  return new Set(words.map(foldPlural));
}

/** True if every word in the smaller set appears in the larger set. */
export function labelsMatch(labelA, labelB) {
  const a = labelWordSet(labelA);
  const b = labelWordSet(labelB);
  if (a.size === 0 || b.size === 0) return false;
  const [smaller, larger] = a.size <= b.size ? [a, b] : [b, a];
  for (const word of smaller) {
    if (!larger.has(word)) return false;
  }
  return true;
}

export const KNOWN_STATUS_TOKENS = ['NONE', 'OBSERVED', 'PARTICIPATED', 'EXECUTED', 'OWNED'];

/** Extracts the set of recognized professional-status tokens present in free text. */
export function extractStatusTokens(text) {
  return KNOWN_STATUS_TOKENS
    .filter((t) => new RegExp(`\\b${t}\\b`).test(text))
    .sort();
}

// Shared parser for 02-FULL-STACK-QA-HANDBOOK/22-SYSTEM-PATTERNS/README.md's
// status table, used by validate-registry.mjs's system-patterns sync check
// (Codex final-verification fix, N5: "if practical, add a consistency
// regression so current System Patterns status cannot drift from
// patterns.yaml again").
// TR: Bu dosya, 22-SYSTEM-PATTERNS/README.md'nin durum tablosunu ayrıştırır
// — N5'in tam olarak bulduğu drift (Retry hâlâ IMPLEMENTED yazıyordu,
// canonical DOCUMENTED_ONLY olduğu hâlde) bir daha SESSİZCE geri
// gelemesin diye.

/** Parses the `| Pattern | Status | Real evidence in this repo |` table. */
export function parseSystemPatternsTable(markdown) {
  const lines = markdown.split('\n');
  const rows = [];
  let inTable = false;
  for (const line of lines) {
    if (/^\|\s*Pattern\s*\|/i.test(line)) {
      inTable = true;
      continue;
    }
    if (!inTable) continue;
    if (/^\|\s*-+\s*\|/.test(line)) continue; // header separator row
    if (!line.startsWith('|')) break; // table ended
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 2) continue;
    const linkMatch = cells[0].match(/\]\(([^)]+)\)/);
    if (!linkMatch) continue; // not a real pattern row (defensive)
    rows.push({ label: cells[0], file: linkMatch[1], status: cells[1] });
  }
  return rows;
}

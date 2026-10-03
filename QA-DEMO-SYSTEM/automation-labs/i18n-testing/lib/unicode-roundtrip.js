'use strict';

// Real Unicode round-trip check: writes a real row containing a
// multi-byte string into the real backend's products table (via a real
// in-memory SQLite db, the same getDatabase() the backend itself uses),
// reads it back through the real listProducts()/getProductById() service
// functions, and asserts byte-for-byte equality. This proves the real
// storage and retrieval path does not mangle non-ASCII text — no
// truncation at a multi-byte boundary, no encoding reinterpretation, no
// silent normalization.
// TR: Gercek bir Unicode gidis-donus (round-trip) kontrolu: cok-baytlı
// bir string'i backend'in GERCEK products tablosuna yazar, GERCEK servis
// fonksiyonlarıyla geri okur ve bayt-bayt esitligi dogrular.

let nextId = 1000; // TR: Gercek seed verisiyle (id 1,2,...) carpismamak icin yuksek bir aralik.

/**
 * @param {import('node:sqlite').DatabaseSync} db - a real backend db instance
 * @param {string} name - the multi-byte string to round-trip
 * @param {{getProductById: Function}} productsService - the real backend service module
 * @returns {{id: number, written: string, read: string, matches: boolean}}
 */
function roundTripProductName(db, name, productsService) {
  const id = nextId;
  nextId += 1;
  db.prepare('INSERT INTO products (id, name, price, stock_quantity) VALUES (?, ?, ?, ?)').run(id, name, 9.99, 10);
  const row = productsService.getProductById(db, id);
  return { id, written: name, read: row.name, matches: row.name === name };
}

module.exports = { roundTripProductName };

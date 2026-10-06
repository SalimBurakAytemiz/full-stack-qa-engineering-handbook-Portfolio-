'use strict';

// Deliberate, labeled mutations of a REAL current API response, used only
// to prove the compatibility checker actually detects what it claims to —
// the same "prove the detector detects" discipline used throughout this
// lab suite. These are never presented as real future API changes, only
// as simulated candidates for detection.
// TR: GERCEK bir mevcut API yanitinin kasitli, etiketlenmis mutasyonlari —
// sadece uyumluluk denetleyicisinin gercekten iddia ettigini tespit
// ettigini kanitlamak icin kullanilir.

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** Simulates a breaking change: a field a prior consumer relied on is removed from every item. */
function simulateFieldRemoved(realResponse, fieldName) {
  const candidate = deepClone(realResponse);
  for (const product of candidate.products) {
    delete product[fieldName];
  }
  return candidate;
}

/** Simulates a breaking change: a field's type changes (e.g. a number becomes a string). */
function simulateTypeChanged(realResponse, fieldName, newValue) {
  const candidate = deepClone(realResponse);
  for (const product of candidate.products) {
    product[fieldName] = newValue;
  }
  return candidate;
}

/** Simulates a safe, additive change: a brand-new field appears that the baseline never declared. */
function simulateFieldAdded(realResponse, fieldName, value) {
  const candidate = deepClone(realResponse);
  for (const product of candidate.products) {
    product[fieldName] = value;
  }
  return candidate;
}

module.exports = { simulateFieldRemoved, simulateTypeChanged, simulateFieldAdded };

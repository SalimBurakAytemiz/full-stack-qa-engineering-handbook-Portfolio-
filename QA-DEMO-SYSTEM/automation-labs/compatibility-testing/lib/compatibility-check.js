'use strict';

// Real backward-compatibility check: validates a current API response
// sample against a frozen baseline JSON Schema using a real AJV validator,
// then classifies the result:
//   - BREAKING: AJV found a `required` or `type` violation — a field a
//     prior consumer depended on is missing or changed shape.
//   - SAFE_ADDITIVE: AJV found no violation, but the current sample has
//     extra fields the baseline never declared — new, backward-compatible.
//   - NO_CHANGE: AJV found no violation and no extra fields.
// TR: Gercek bir geriye-donuk-uyumluluk kontrolu: mevcut API yanitini
// dondurulmus (frozen) bir baseline JSON Schema'ya karsi gercek bir AJV
// validator ile dogrular, sonucu BREAKING / SAFE_ADDITIVE / NO_CHANGE
// olarak siniflandirir.

function findAdditiveKeys(schemaNode, sampleNode, pathPrefix) {
  const additive = [];
  if (!schemaNode) return additive;

  if (schemaNode.type === 'object' && sampleNode && typeof sampleNode === 'object' && !Array.isArray(sampleNode)) {
    const schemaKeys = new Set(Object.keys(schemaNode.properties || {}));
    for (const key of Object.keys(sampleNode)) {
      const childPath = pathPrefix ? `${pathPrefix}.${key}` : key;
      if (!schemaKeys.has(key)) {
        additive.push(childPath);
      } else {
        additive.push(...findAdditiveKeys(schemaNode.properties[key], sampleNode[key], childPath));
      }
    }
  } else if (schemaNode.type === 'array' && Array.isArray(sampleNode) && sampleNode.length > 0) {
    // TR: Sadece temsili ilk eleman kontrol edilir (dizideki her elemanin ayni sekle sahip oldugu varsayilir).
    additive.push(...findAdditiveKeys(schemaNode.items, sampleNode[0], `${pathPrefix}[]`));
  }
  return additive;
}

/**
 * @param {import('ajv')} ajv - a real Ajv instance
 * @param {object} baselineSchema - a frozen baseline JSON Schema document
 * @param {object} currentSample - a real current API response sample
 * @returns {{classification: 'BREAKING'|'SAFE_ADDITIVE'|'NO_CHANGE', valid: boolean, breakingErrors: Array, additiveFields: string[]}}
 */
function checkCompatibility(ajv, baselineSchema, currentSample) {
  const validate = ajv.compile(baselineSchema);
  const valid = validate(currentSample);
  const breakingErrors = valid ? [] : validate.errors.filter((e) => e.keyword === 'required' || e.keyword === 'type');

  if (breakingErrors.length > 0) {
    return { classification: 'BREAKING', valid: false, breakingErrors, additiveFields: [] };
  }

  const additiveFields = findAdditiveKeys(baselineSchema, currentSample, '');
  if (additiveFields.length > 0) {
    return { classification: 'SAFE_ADDITIVE', valid: true, breakingErrors: [], additiveFields };
  }

  return { classification: 'NO_CHANGE', valid: true, breakingErrors: [], additiveFields: [] };
}

module.exports = { checkCompatibility, findAdditiveKeys };

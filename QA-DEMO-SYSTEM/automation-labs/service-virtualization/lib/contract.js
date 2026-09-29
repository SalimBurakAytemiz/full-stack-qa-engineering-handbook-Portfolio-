'use strict';

// A minimal, real consumer-driven-contract (Pact-style) verifier built
// on ajv (JSON Schema, already a real dependency of this workspace —
// see ai-systems/lib/schema-validator.js) rather than pulling in the
// Pact library itself. This repository avoids dependency bloat and
// prefers a small, understood implementation of the technique over a
// black-box one. The technique this proves is real and standard:
// define ONE contract, verify a CONSUMER-side interaction against it
// (a virtualized/stubbed double), then verify the SAME contract
// against the REAL PROVIDER's actual response — if both pass, the
// consumer's expectations and the provider's real behavior are
// verifiably in agreement.
// TR: ajv (JSON Schema) üzerine kurulu, gerçek, minimal bir
// tüketici-güdümlü sözleşme (Pact tarzı) doğrulayıcı — Pact
// kütüphanesinin kendisini eklemek yerine. Kanıtlanan teknik gerçek ve
// standarttır: TEK bir sözleşme tanımlanır, bir TÜKETİCİ tarafı
// etkileşimi (sanallaştırılmış bir çift) buna karşı doğrulanır, sonra
// AYNI sözleşme GERÇEK SAĞLAYICI'nın gerçek yanıtına karşı doğrulanır.

const Ajv = require('ajv');

const ajv = new Ajv({ allErrors: true, strict: false });

function defineContract(name, schema) {
  const validate = ajv.compile(schema);
  return {
    name,
    schema,
    verify(actualResponseBody) {
      const valid = validate(actualResponseBody);
      return {
        valid,
        errors: valid ? [] : (validate.errors || []).map((e) => `${e.instancePath || '(root)'} ${e.message}`),
      };
    },
  };
}

module.exports = { defineContract };

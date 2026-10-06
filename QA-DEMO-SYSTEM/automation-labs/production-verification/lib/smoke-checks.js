'use strict';

// Real smoke checks against a real running backend — every check here
// makes a real HTTP request with `fetch` and inspects the real response;
// there is no mocked transport anywhere in this file.
// TR: Gercek calisan bir backend'e karsi GERCEK duman testleri (smoke
// checks) — her kontrol gercek bir HTTP istegi yapar.

/**
 * @param {string} baseUrl
 */
async function checkHealth(baseUrl) {
  const res = await fetch(`${baseUrl}/api/health`, { signal: AbortSignal.timeout(2000) });
  const body = await res.json().catch(() => null);
  const ok = res.ok && body && body.status === 'ok';
  return { ok, detail: `status=${res.status}, body=${JSON.stringify(body)}` };
}

/**
 * @param {string} baseUrl
 * @param {string} email
 * @param {string} password
 */
async function checkAuthLogin(baseUrl, email, password) {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
    signal: AbortSignal.timeout(2000),
  });
  const body = await res.json().catch(() => null);
  const ok = res.ok && typeof body?.token === 'string' && body.token.length > 0;
  return { ok, detail: `status=${res.status}, hasToken=${Boolean(body?.token)}` };
}

/**
 * @param {string} baseUrl
 */
async function checkProductsList(baseUrl) {
  const res = await fetch(`${baseUrl}/api/products`, { signal: AbortSignal.timeout(2000) });
  const body = await res.json().catch(() => null);
  const ok = res.ok && Array.isArray(body?.products);
  return { ok, detail: `status=${res.status}, productCount=${body?.products?.length}` };
}

module.exports = { checkHealth, checkAuthLogin, checkProductsList };

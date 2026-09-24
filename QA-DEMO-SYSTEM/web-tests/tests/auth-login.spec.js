const { test, expect } = require('@playwright/test');
const { login } = require('./helpers');

// Phase 8 — Functional Testing + Network Inspection + Storage + Cookies +
// Browser DevTools, all against the REAL login form (frontend/index.html)
// and the REAL backend (no mocked fetch/route interception — this proves
// the actual frontend/backend contract, not an assumed one).

test('Functional: valid credentials log in and navigate to the products page', async ({ page }) => {
  await login(page, 'test.active01@example.com', 'ValidPass123!');
  await expect(page).toHaveURL(/products\.html$/);
  await expect(page.getByTestId('product-list')).toBeVisible();
});

test('Functional: invalid credentials show an inline error and do not navigate', async ({ page }) => {
  await page.goto('/index.html');
  await page.getByTestId('login-email').fill('test.active01@example.com');
  await page.getByTestId('login-password').fill('WrongPassword999!');
  await page.getByTestId('login-submit').click();

  const errorEl = page.getByTestId('login-error');
  await expect(errorEl).toBeVisible();
  await expect(errorEl).toHaveText('Email veya şifre hatalı');
  await expect(page).toHaveURL(/index\.html$/);
});

test('Network Inspection: the login submit issues a real POST /api/auth/login and the UI reacts to its actual response', async ({ page }) => {
  const requests = [];
  let capturedStatus;
  let capturedBody;

  // Intercept via routing (not the 'response' event): the page navigates
  // immediately after this call resolves (login.js does
  // `window.location.href = 'products.html'`), and Chrome's DevTools
  // Protocol releases a response body as soon as the page that received it
  // navigates away — reading it from a 'response' listener loses this race
  // intermittently. Routing lets us read the real body ourselves BEFORE
  // handing the real response back to the page, which is race-free.
  await page.route('**/api/auth/login', async (route) => {
    const response = await route.fetch();
    capturedStatus = response.status();
    capturedBody = await response.json();
    requests.push(route.request());
    await route.fulfill({ response });
  });

  await page.goto('/index.html');
  await page.getByTestId('login-email').fill('test.active01@example.com');
  await page.getByTestId('login-password').fill('ValidPass123!');
  await page.getByTestId('login-submit').click();
  await page.waitForURL('**/products.html');

  assertSingleLoginRequest(requests);
  const req = requests[0];
  expect(req.method()).toBe('POST');
  const postData = JSON.parse(req.postData());
  expect(postData).toEqual({ email: 'test.active01@example.com', password: 'ValidPass123!' });
  // The real password IS present in the outgoing request body (this is how
  // the login form has to work over plain fetch) — the point of this
  // assertion is to prove the UI sends exactly what the form fields
  // contain, nothing more, nothing hashed/obfuscated client-side (this app
  // deliberately has no client-side hashing, see ARCHITECTURE.md).

  expect(capturedStatus).toBe(200);
  expect(capturedBody.user.email).toBe('test.active01@example.com');
  expect(capturedBody.token).toMatch(/^demo-session-/);
});

function assertSingleLoginRequest(requests) {
  if (requests.length !== 1) {
    throw new Error(`expected exactly one /api/auth/login request, saw ${requests.length}`);
  }
}

test('Storage: a successful login stores the session token and email in sessionStorage, not localStorage', async ({ page }) => {
  await login(page, 'test.active01@example.com', 'ValidPass123!');

  const sessionValues = await page.evaluate(() => ({
    token: sessionStorage.getItem('qa_demo_token'),
    email: sessionStorage.getItem('qa_demo_user_email'),
  }));
  expect(sessionValues.token).toMatch(/^demo-session-/);
  expect(sessionValues.email).toBe('test.active01@example.com');

  // The app deliberately never writes to localStorage — verifying the
  // negative is as important as verifying the positive (a wrong storage
  // choice here would survive across browser restarts unexpectedly).
  const localStorageLength = await page.evaluate(() => localStorage.length);
  expect(localStorageLength).toBe(0);
});

test('Cookies: this app is cookie-free — auth uses a Bearer token in sessionStorage, never a session cookie', async ({ page }) => {
  await login(page, 'test.active01@example.com', 'ValidPass123!');

  const cookies = await page.context().cookies();
  expect(cookies).toEqual([]);

  const documentCookie = await page.evaluate(() => document.cookie);
  expect(documentCookie).toBe('');
});

test('Browser DevTools: no uncaught console errors occur during a full login flow', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  await login(page, 'test.active01@example.com', 'ValidPass123!');

  expect(consoleErrors).toEqual([]);
});

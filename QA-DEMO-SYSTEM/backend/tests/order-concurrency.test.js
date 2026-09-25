const { test } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./helpers/test-server');
const { loginAs } = require('./helpers/auth-helper');

// Codex fix-campaign B8 (P2, Phase 15): case-study-02-ecommerce-order-flow.md
// labeled "Overselling / kısmi yazma" as **KAPALI** (closed) citing only
// Phase 5's single-transaction (BEGIN/COMMIT/ROLLBACK) tests and Phase 7's
// CRUD/FK/CHECK tests — neither of which fires two GENUINELY CONCURRENT
// requests at the same low-stock product. Single-transaction atomicity
// proves one order's write is all-or-nothing; it does NOT by itself prove
// two SEPARATE, concurrently-arriving orders can't both "win" the same
// last unit of stock. No such test existed anywhere in this campaign
// before this file (grep-verified across tests/: only concurrent LOGIN
// and concurrent WS-connection tests existed, never concurrent ORDER
// creation against shared, scarce stock). This is that missing test.
//
// Real concurrent HTTP requests (Promise.all against the live test
// server, not a direct in-process service-function call) are used
// deliberately — a service-function-level test would prove less, since
// it wouldn't exercise the actual request-handling path an overselling
// bug would occur in.

async function createOrder(baseUrl, token, productId, quantity) {
  return fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items: [{ product_id: productId, quantity }], payment_token: 'TEST-CARD-APPROVED' }),
  });
}

test('Overselling: two genuinely concurrent orders for the LAST unit of stock — exactly one wins, the other gets 409, stock never goes negative', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  // Arrange: force product 3 (seeded stock_quantity: 5) down to exactly 1
  // remaining unit — a direct DB write for TEST SETUP only, not the
  // action under test (the two concurrent orders below are the real
  // action being exercised).
  ctx.db.prepare('UPDATE products SET stock_quantity = 1 WHERE id = 3').run();

  const tokenA = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');
  const tokenB = await loginAs(ctx.baseUrl, 'test.active02@example.com', 'ValidPass123!');

  // Fired together via Promise.all — genuinely concurrent HTTP requests
  // against the live server, not sequential awaits.
  const [resA, resB] = await Promise.all([
    createOrder(ctx.baseUrl, tokenA, 3, 1),
    createOrder(ctx.baseUrl, tokenB, 3, 1),
  ]);
  const [bodyA, bodyB] = await Promise.all([resA.json(), resB.json()]);

  const statuses = [resA.status, resB.status].sort();
  assert.deepEqual(statuses, [201, 409], `expected exactly one 201 (won the last unit) and one 409 (insufficient stock), got: ${statuses}`);

  const winnerBody = resA.status === 201 ? bodyA : bodyB;
  const loserBody = resA.status === 409 ? bodyA : bodyB;
  assert.equal(winnerBody.order.status, 'PAID');
  assert.match(loserBody.error, /Yetersiz stok/);

  // The database, not the API response, is the source of truth: exactly
  // one order for product 3 in this run, and stock is 0 — never negative,
  // never still 1 (which would mean the loser's request also silently
  // decremented it before being reported as failed).
  const finalStock = ctx.db.prepare('SELECT stock_quantity FROM products WHERE id = 3').get();
  assert.equal(finalStock.stock_quantity, 0);

  const orderItemsForProduct3 = ctx.db
    .prepare('SELECT COUNT(*) AS count FROM order_items WHERE product_id = 3')
    .get();
  assert.equal(orderItemsForProduct3.count, 1, 'exactly one order_items row for product 3 — the loser must not have written anything');
});

test('Overselling: 5 concurrent orders for a single unit of stock — exactly 1 wins, 4 lose, stock never goes negative', async (t) => {
  const ctx = startTestServer();
  t.after(() => ctx.close());

  ctx.db.prepare('UPDATE products SET stock_quantity = 1 WHERE id = 3').run();

  // 5 distinct users are needed since this app allows only one active
  // session flow per login call, but concurrency is what's under test,
  // not per-user isolation — reusing the SAME logged-in user 5 times over
  // is equally valid for proving the stock-decrement race is safe, and
  // avoids depending on more than the 2 seeded users this project ships.
  const token = await loginAs(ctx.baseUrl, 'test.active01@example.com', 'ValidPass123!');

  const responses = await Promise.all(
    Array.from({ length: 5 }, () => createOrder(ctx.baseUrl, token, 3, 1))
  );
  const statusCounts = responses.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  assert.equal(statusCounts[201] || 0, 1, `expected exactly 1 winning (201) order, got status distribution: ${JSON.stringify(statusCounts)}`);
  assert.equal(statusCounts[409] || 0, 4, `expected exactly 4 losing (409) orders, got status distribution: ${JSON.stringify(statusCounts)}`);

  const finalStock = ctx.db.prepare('SELECT stock_quantity FROM products WHERE id = 3').get();
  assert.equal(finalStock.stock_quantity, 0, 'stock must land at exactly 0, never negative — a negative value would prove overselling occurred');
});

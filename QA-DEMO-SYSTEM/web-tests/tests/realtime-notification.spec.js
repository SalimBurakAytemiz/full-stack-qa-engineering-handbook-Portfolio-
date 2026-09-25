const { test, expect } = require('@playwright/test');
const { login } = require('./helpers');

// Phase 8 capstone — Frontend/Backend Validation, full stack: a real
// browser tab (WebSocket client in frontend/js/notifications.js) receives
// a genuine server push the moment an order is paid, driven by a SEPARATE
// real HTTP request (as if placed from another device/tab for the same
// user — this app's frontend has no order-creation UI at all, only
// login/browse/notifications, see EXECUTION.md section 2 for why).

test('Realtime: a live products page receives and renders the order-paid notification pushed over WebSocket', async ({ page, request }) => {
  await login(page, 'test.active02@example.com', 'ValidPass123!');
  // notifications.js opens the WebSocket connection synchronously on page
  // load (see connectRealtime()); give it a moment to complete the
  // upgrade handshake before the triggering order is created.
  await page.waitForTimeout(200);

  // A second real session for the SAME user (e.g. another tab/device) —
  // proves the push is user-scoped, not connection-scoped, matching the
  // Phase 6 WS Duplicate Events finding.
  const loginRes = await request.post('/api/auth/login', {
    data: { email: 'test.active02@example.com', password: 'ValidPass123!' },
  });
  const { token } = await loginRes.json();

  const orderRes = await request.post('/api/orders', {
    headers: { Authorization: `Bearer ${token}` },
    data: { items: [{ product_id: 4, quantity: 1 }], payment_token: 'TEST-CARD-APPROVED' },
  });
  const orderBody = await orderRes.json();
  expect(orderRes.status()).toBe(201);

  const notificationItem = page.getByTestId('notification-item').first();
  await expect(notificationItem).toHaveText(`Order #${orderBody.order.id} payment approved.`);
});

const { test, expect } = require('@playwright/test');
const { login } = require('./helpers');

// Phase 8 — Frontend/Backend Validation: the DOM the browser actually
// renders is compared against the real API response for the SAME request,
// proving the frontend is not silently drifting from what the backend
// returns (a classic "UI shows stale/wrong data" bug class).

test('Frontend/Backend Validation: every rendered product matches the live GET /api/products response exactly', async ({ page, request }) => {
  await login(page, 'test.active01@example.com', 'ValidPass123!');

  const apiBody = await request.get('/api/products').then((r) => r.json());

  const items = page.getByTestId('product-item');
  await expect(items).toHaveCount(apiBody.products.length);

  for (const product of apiBody.products) {
    const item = items.filter({ hasText: product.name });
    await expect(item.getByTestId('product-name')).toHaveText(product.name);
    await expect(item.getByTestId('product-price')).toHaveText(`${product.price.toFixed(2)} TL`);
    await expect(item.getByTestId('product-stock')).toHaveText(product.in_stock ? 'Stokta' : 'Stok Yok');
  }
});

test('Frontend/Backend Validation: the out-of-stock seeded product renders "Stok Yok"', async ({ page }) => {
  await login(page, 'test.active01@example.com', 'ValidPass123!');

  const mouseItem = page.getByTestId('product-item').filter({ hasText: 'QA Demo Mouse' });
  await expect(mouseItem.getByTestId('product-stock')).toHaveText('Stok Yok');
});

test('Functional: an in-stock seeded product renders "Stokta"', async ({ page }) => {
  await login(page, 'test.active01@example.com', 'ValidPass123!');

  const keyboardItem = page.getByTestId('product-item').filter({ hasText: 'QA Demo Klavye' });
  await expect(keyboardItem.getByTestId('product-stock')).toHaveText('Stokta');
});

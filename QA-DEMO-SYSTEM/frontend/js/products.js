async function loadProducts() {
  const listEl = document.getElementById('product-list');
  const errorEl = document.getElementById('products-error');

  try {
    const res = await fetch('/api/products');
    const body = await res.json();

    if (!res.ok) {
      errorEl.textContent = body.error || 'Ürünler yüklenemedi';
      errorEl.hidden = false;
      return;
    }

    listEl.innerHTML = '';
    for (const product of body.products) {
      const item = document.createElement('li');
      item.dataset.testid = 'product-item';
      item.innerHTML = `
        <span data-testid="product-name">${product.name}</span>
        <span data-testid="product-price">${product.price.toFixed(2)} TL</span>
        <span data-testid="product-stock">${product.in_stock ? 'Stokta' : 'Stok Yok'}</span>
      `;
      listEl.appendChild(item);
    }
  } catch (err) {
    errorEl.textContent = 'Sunucuya bağlanılamadı';
    errorEl.hidden = false;
  }
}

loadProducts();

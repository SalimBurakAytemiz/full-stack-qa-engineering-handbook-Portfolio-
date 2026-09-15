const express = require('express');
const { listProducts, getProductById } = require('../services/products.service');

function createProductsRouter(db) {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.json({ products: listProducts(db) });
  });

  router.get('/:id', (req, res) => {
    const product = getProductById(db, Number(req.params.id));
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }
    res.json({ product });
  });

  return router;
}

module.exports = { createProductsRouter };

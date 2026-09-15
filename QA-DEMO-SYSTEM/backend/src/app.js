const path = require('node:path');
const express = require('express');
const { createAuthRouter } = require('./routes/auth.routes');
const { createProductsRouter } = require('./routes/products.routes');
const { createOrdersRouter } = require('./routes/orders.routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

function createApp(db) {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', createAuthRouter(db));
  app.use('/api/products', createProductsRouter(db));
  app.use('/api/orders', createOrdersRouter(db));

  const frontendDir = path.join(__dirname, '..', '..', 'frontend');
  app.use(express.static(frontendDir));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };

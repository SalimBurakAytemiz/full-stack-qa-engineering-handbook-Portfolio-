const path = require('node:path');
const express = require('express');
const { createAuthRouter } = require('./routes/auth.routes');
const { createProductsRouter } = require('./routes/products.routes');
const { createOrdersRouter } = require('./routes/orders.routes');
const { createNotificationsRouter } = require('./routes/notifications.routes');
const { createGraphQLHandler } = require('./graphql');
const { jsonParseErrorHandler, notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { requestContext } = require('./middleware/requestContext');

function createApp(db, { pushNotificationToUser } = {}) {
  const app = express();
  app.use(express.json());
  app.use(jsonParseErrorHandler);
  app.use(requestContext);

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', createAuthRouter(db));
  app.use('/api/products', createProductsRouter(db));
  app.use('/api/orders', createOrdersRouter(db, pushNotificationToUser));
  app.use('/api/notifications', createNotificationsRouter(db));
  app.post('/graphql', createGraphQLHandler(db, pushNotificationToUser));

  const frontendDir = path.join(__dirname, '..', '..', 'frontend');
  app.use(express.static(frontendDir));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };

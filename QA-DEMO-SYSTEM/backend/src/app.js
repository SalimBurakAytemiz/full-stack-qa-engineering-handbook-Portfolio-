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
  // Codex fix-campaign B6: requestContext must run BEFORE express.json(),
  // not after. jsonParseErrorHandler is an error-handling middleware (4
  // args) — when express.json() hits a SyntaxError, Express jumps straight
  // to it and it sends the 400 response directly, WITHOUT calling next().
  // With requestContext registered after both (the previous order), it
  // never ran for a malformed-JSON request, so that response had no
  // X-Request-Id header and no access-log line at all. requestContext has
  // no dependency on the parsed body, so moving it first is safe and gives
  // every response — including a parse failure — a correlation id.
  app.use(requestContext);
  app.use(express.json());
  app.use(jsonParseErrorHandler);

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

const express = require('express');
const { requireAuth } = require('../middleware/requireAuth');
const { createOrder, getOrderById } = require('../services/orders.service');

// pushNotificationToUser is injected (not imported directly) so orders.service
// / this route stay decoupled from the WebSocket transport — tests and any
// caller that doesn't need realtime delivery can omit it (default no-op).
function createOrdersRouter(db, pushNotificationToUser = () => false) {
  const router = express.Router();
  router.use(requireAuth(db));

  router.post('/', (req, res) => {
    const { items, payment_token: paymentToken } = req.body || {};
    const result = createOrder(db, req.userId, items, paymentToken);

    if (!result.ok) {
      return res.status(result.status).json({ error: result.message });
    }

    if (result.notification) {
      pushNotificationToUser(result.notification.user_id, result.notification);
    }

    return res.status(result.status).json({
      order: { id: result.orderId, status: result.orderStatus, total: result.total },
    });
  });

  router.get('/:id', (req, res) => {
    const order = getOrderById(db, Number(req.params.id), req.userId);
    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }
    res.json({ order });
  });

  return router;
}

module.exports = { createOrdersRouter };

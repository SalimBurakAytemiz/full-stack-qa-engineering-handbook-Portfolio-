const express = require('express');
const { requireAuth } = require('../middleware/requireAuth');
const { listNotificationsForUser } = require('../services/notifications.service');

function createNotificationsRouter(db) {
  const router = express.Router();
  router.use(requireAuth(db));

  router.get('/', (req, res) => {
    res.json({ notifications: listNotificationsForUser(db, req.userId) });
  });

  return router;
}

module.exports = { createNotificationsRouter };

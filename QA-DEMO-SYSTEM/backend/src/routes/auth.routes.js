const express = require('express');
const { authenticate } = require('../services/auth.service');

function createAuthRouter(db) {
  const router = express.Router();

  router.post('/login', (req, res) => {
    const { email, password } = req.body || {};
    const result = authenticate(db, email, password);

    if (!result.ok) {
      return res.status(result.status).json({ error: result.message });
    }

    return res.status(result.status).json({ token: result.token, user: result.user });
  });

  return router;
}

module.exports = { createAuthRouter };

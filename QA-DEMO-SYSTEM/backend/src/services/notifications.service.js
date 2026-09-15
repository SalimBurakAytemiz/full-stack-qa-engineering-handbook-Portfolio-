function createNotificationFromOrderPaidEvent(db, event) {
  const message = `Order #${event.orderId} payment approved.`;

  const info = db
    .prepare('INSERT INTO notifications (user_id, type, message, order_id) VALUES (?, ?, ?, ?)')
    .run(event.userId, event.eventType, message, event.orderId);

  // No secrets/tokens/passwords logged — only correlation identifiers.
  console.log(
    `[notification] persisted id=${info.lastInsertRowid} user_id=${event.userId} order_id=${event.orderId}`
  );

  return {
    id: info.lastInsertRowid,
    user_id: event.userId,
    type: event.eventType,
    message,
    order_id: event.orderId,
    is_read: 0,
  };
}

function listNotificationsForUser(db, userId) {
  return db
    .prepare(
      `SELECT id, type, message, order_id, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC, id DESC`
    )
    .all(userId);
}

module.exports = { createNotificationFromOrderPaidEvent, listNotificationsForUser };

const { WebSocketServer } = require('ws');
const { URL } = require('node:url');

const WS_PATH = '/ws';

// Minimal authenticated realtime layer (P4.3 section 7): a client connects
// to /ws?token=<sessionToken>; the token is validated against the same
// `sessions` table requireAuth uses. An invalid/missing token closes the
// connection immediately — no anonymous WebSocket access.
//
// YÖNLENDİRME/İZOLASYON NEDENİ (Codex final fix round N7): socket'ler
// `userId` anahtarıyla eşlenir (bir bağlantı KİMLİĞİYLE değil) — bu, B1
// fix'inin (GraphQL→WebSocket push) ve mevcut REST push yolunun İKİSİNİN
// de "bu bildirim yalnızca SAHİBİ kullanıcıya gider" garantisinin temelidir.
// Aynı kullanıcının birden fazla sekmesi/cihazı AYNI Set içinde tutulur
// (hepsine push edilir), ama BAŞKA bir kullanıcının Set'i asla karışmaz —
// bu, `websocket-events-advanced.test.js`'in "Duplicate Events" ve
// "cross-user isolation" testlerinin doğrudan dayandığı mimari garantidir.
function createRealtimeServer(httpServer, db) {
  const wss = new WebSocketServer({ noServer: true });
  const socketsByUserId = new Map();

  function addSocket(userId, ws) {
    if (!socketsByUserId.has(userId)) {
      socketsByUserId.set(userId, new Set());
    }
    socketsByUserId.get(userId).add(ws);
  }

  function removeSocket(userId, ws) {
    const sockets = socketsByUserId.get(userId);
    if (!sockets) {
      return;
    }
    sockets.delete(ws);
    if (sockets.size === 0) {
      socketsByUserId.delete(userId);
    }
  }

  httpServer.on('upgrade', (req, socket, head) => {
    const { pathname, searchParams } = new URL(req.url, 'http://localhost');
    if (pathname !== WS_PATH) {
      socket.destroy();
      return;
    }

    const token = searchParams.get('token');
    const session = token && db.prepare('SELECT user_id FROM sessions WHERE token = ?').get(token);

    if (!session) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      ws.userId = session.user_id;
      wss.emit('connection', ws, req);
    });
  });

  wss.on('connection', (ws) => {
    addSocket(ws.userId, ws);
    ws.on('close', () => removeSocket(ws.userId, ws));
  });

  // Best-effort realtime delivery: the notification is already durably
  // persisted by notifications.service before this is called, so a missing
  // live connection (user not currently connected) is not an error — it
  // just means the user will see it next time they fetch
  // GET /api/notifications.
  function pushNotificationToUser(userId, notification) {
    const sockets = socketsByUserId.get(userId);
    if (!sockets || sockets.size === 0) {
      return false;
    }

    const payload = JSON.stringify({ type: 'notification', notification });
    let delivered = false;
    for (const ws of sockets) {
      if (ws.readyState === ws.OPEN) {
        ws.send(payload);
        delivered = true;
      }
    }

    // No secrets/tokens/passwords logged — only correlation identifiers.
    console.log(
      `[websocket] delivered=${delivered} user_id=${userId} notification_id=${notification.id}`
    );
    return delivered;
  }

  function connectedUserCount() {
    return socketsByUserId.size;
  }

  // Forcibly terminates every tracked socket. http.Server#close() waits for
  // every open connection to end on its own — including upgraded WebSocket
  // sockets, which are no longer tracked as ordinary HTTP connections once
  // handleUpgrade() hands them off — so a graceful server shutdown (tests,
  // process exit) must close these explicitly first.
  function closeAll() {
    for (const sockets of socketsByUserId.values()) {
      for (const ws of sockets) {
        ws.terminate();
      }
    }
    socketsByUserId.clear();
  }

  return { wss, pushNotificationToUser, connectedUserCount, closeAll };
}

module.exports = { createRealtimeServer, WS_PATH };

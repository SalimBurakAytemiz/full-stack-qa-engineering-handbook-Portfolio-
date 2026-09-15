const http = require('node:http');
const { createApp } = require('../../src/app');
const { getDatabase } = require('../../src/database/connection');
const { seedDatabase } = require('../../src/database/seed');
const { createRealtimeServer } = require('../../src/realtime/websocketServer');

function startTestServer() {
  const db = getDatabase(':memory:');
  seedDatabase(db);

  const httpServer = http.createServer();
  const realtime = createRealtimeServer(httpServer, db);
  const app = createApp(db, { pushNotificationToUser: realtime.pushNotificationToUser });
  httpServer.on('request', app);

  httpServer.listen(0);
  const { port } = httpServer.address();

  return {
    db,
    realtime,
    baseUrl: `http://127.0.0.1:${port}`,
    wsUrl: `ws://127.0.0.1:${port}/ws`,
    async close() {
      // http.Server#close() waits for every open connection to end on its
      // own before its callback fires. Upgraded WebSocket sockets are no
      // longer tracked as ordinary HTTP connections, so closeAllConnections()
      // alone does not reach them — terminate them explicitly first via the
      // realtime server, or the close() callback (and this whole test) hangs.
      realtime.closeAll();
      await new Promise((resolve) => {
        httpServer.close(resolve);
        httpServer.closeAllConnections();
      });
      db.close();
    },
  };
}

module.exports = { startTestServer };

const http = require('node:http');
const { createApp } = require('./app');
const { getDatabase } = require('./database/connection');
const { seedDatabase } = require('./database/seed');
const { createRealtimeServer } = require('./realtime/websocketServer');
const config = require('./config');

const db = getDatabase(config.dbPath);

const usersCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
if (usersCount === 0) {
  seedDatabase(db);
}

const httpServer = http.createServer();
const { pushNotificationToUser } = createRealtimeServer(httpServer, db);

const app = createApp(db, { pushNotificationToUser });
httpServer.on('request', app);

httpServer.listen(config.port, () => {
  console.log(`QA Demo System backend http://localhost:${config.port} adresinde çalışıyor.`);
});

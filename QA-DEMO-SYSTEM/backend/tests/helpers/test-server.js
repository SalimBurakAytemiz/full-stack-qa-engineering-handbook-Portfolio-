const { createApp } = require('../../src/app');
const { getDatabase } = require('../../src/database/connection');
const { seedDatabase } = require('../../src/database/seed');

function startTestServer() {
  const db = getDatabase(':memory:');
  seedDatabase(db);
  const app = createApp(db);
  const server = app.listen(0);
  const { port } = server.address();

  return {
    db,
    baseUrl: `http://127.0.0.1:${port}`,
    async close() {
      await new Promise((resolve) => server.close(resolve));
      db.close();
    },
  };
}

module.exports = { startTestServer };

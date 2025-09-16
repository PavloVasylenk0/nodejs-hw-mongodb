import 'dotenv/config.js';

import { setupServer } from './server.js';
import initMongoConnection from './db/initMongoConnection.js';

async function start() {
  await initMongoConnection();

  const app = setupServer();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

start();

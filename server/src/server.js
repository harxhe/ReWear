import { exec } from 'node:child_process';

import cors from 'cors';
import express from 'express';
import cron from 'node-cron';

import { env } from './config/env.js';
import { connectToDatabase } from './db/mongoose.js';
import { errorHandler } from './middleware/error-handler.js';
import { apiRouter } from './routes/index.js';

const app = express();
const port = env.port;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api', apiRouter);

app.get('/api/health', (_request, response) => {
  response.json({
    message: 'ReWear API is running.',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

await connectToDatabase();

// Schedule a database reset every 2 hours to keep the prototype clean
cron.schedule('0 */2 * * *', () => {
  console.log('Running scheduled database reset...');
  
  exec('npm run db:reset --workspace server && npm run db:setup --workspace server && npm run db:seed --workspace server && npm run db:seed-demo --workspace server', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error during DB reset: ${error.message}`);
      return;
    }
    console.log('Database reset completed successfully.');
  });
});

app.listen(port, () => {
  console.log(`ReWear API listening on port ${port}`);
});

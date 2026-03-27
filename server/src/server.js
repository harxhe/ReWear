import cors from 'cors';
import express from 'express';

import { env } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { apiRouter } from './routes/index.js';

const app = express();
const port = env.port;

app.use(cors());
app.use(express.json());

app.use('/api', apiRouter);

app.get('/api/health', (_request, response) => {
  response.json({
    message: 'ReWear API is running.',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`ReWear API listening on port ${port}`);
});

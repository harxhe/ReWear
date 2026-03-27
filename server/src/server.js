import cors from 'cors';
import express from 'express';

import { env } from './config/env.js';

const app = express();
const port = env.port;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({
    message: 'ReWear API is running.',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log(`ReWear API listening on port ${port}`);
});

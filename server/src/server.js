import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

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

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });
dotenv.config({ path: path.resolve(__dirname, '../../../.env'), quiet: true });

export const env = {
  jwtSecret: process.env.JWT_SECRET || 'change-me',
  mongoUri: process.env.MONGODB_URI || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
};

export function requireMongoUri() {
  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is required to run the API and database scripts.');
  }

  return env.mongoUri;
}

import dotenv from 'dotenv';

dotenv.config();

export const env = {
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'change-me',
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
};

export function requireDatabaseUrl() {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is required to run database scripts.');
  }

  return env.databaseUrl;
}

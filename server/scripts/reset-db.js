import pg from 'pg';

import { requireDatabaseUrl } from '../src/config/env.js';

const { Client } = pg;

const client = new Client({
  connectionString: requireDatabaseUrl(),
});

const resetSql = `
BEGIN;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS badge_definitions CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS materials_registry CASCADE;
DROP TABLE IF EXISTS users CASCADE;
COMMIT;
`;

await client.connect();

try {
  await client.query(resetSql);
  console.log('ReWear database tables dropped successfully.');
} finally {
  await client.end();
}

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import pg from 'pg';

import { requireDatabaseUrl } from '../src/config/env.js';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetFile = process.argv[2];

if (!targetFile) {
  throw new Error('Usage: node scripts/run-sql-file.js <relative-sql-file-path>');
}

const filePath = path.resolve(__dirname, '..', targetFile);
const sql = await readFile(filePath, 'utf8');

const client = new Client({
  connectionString: requireDatabaseUrl(),
});

await client.connect();

try {
  await client.query(sql);
  console.log(`Executed ${targetFile} successfully.`);
} finally {
  await client.end();
}

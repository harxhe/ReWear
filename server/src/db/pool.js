import pg from 'pg';

import { requireDatabaseUrl } from '../config/env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: requireDatabaseUrl(),
});

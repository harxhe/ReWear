import bcrypt from 'bcryptjs';
import { Router } from 'express';

import { asyncHandler } from '../lib/async-handler.js';
import { createAccessToken, requireAuth } from '../lib/auth.js';
import { HttpError } from '../lib/http-error.js';
import { query } from '../db/query.js';

const authRouter = Router();

function sanitizeUser(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    avatarUrl: row.avatar_url,
    totalWaterSavedLiters: Number(row.total_water_saved_liters),
    totalCo2DivertedKg: Number(row.total_co2_diverted_kg),
    createdAt: row.created_at,
  };
}

authRouter.post('/signup', asyncHandler(async (request, response) => {
  const { email, fullName, password, role } = request.body;

  if (!fullName || !email || !password || !role) {
    throw new HttpError(400, 'Full name, email, password, and account role are required.');
  }

  if (!['buyer', 'seller'].includes(role)) {
    throw new HttpError(400, 'Role must be buyer or seller.');
  }

  const existingUser = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);

  if (existingUser.rowCount > 0) {
    throw new HttpError(409, 'An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await query(
    `
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, full_name, email, role, avatar_url, total_water_saved_liters, total_co2_diverted_kg, created_at
    `,
    [fullName, email.toLowerCase(), passwordHash, role],
  );

  const user = sanitizeUser(result.rows[0]);

  response.status(201).json({
    token: createAccessToken(user),
    user,
  });
}));

authRouter.post('/login', asyncHandler(async (request, response) => {
  const { email, password } = request.body;

  if (!email || !password) {
    throw new HttpError(400, 'Email and password are required.');
  }

  const result = await query(
    `
      SELECT id, full_name, email, role, avatar_url, password_hash, total_water_saved_liters, total_co2_diverted_kg, created_at
      FROM users
      WHERE email = $1
    `,
    [email.toLowerCase()],
  );

  if (result.rowCount === 0) {
    throw new HttpError(401, 'Invalid email or password.');
  }

  const row = result.rows[0];
  const isValidPassword = await bcrypt.compare(password, row.password_hash);

  if (!isValidPassword) {
    throw new HttpError(401, 'Invalid email or password.');
  }

  const user = sanitizeUser(row);

  response.json({
    token: createAccessToken(user),
    user,
  });
}));

authRouter.get('/me', requireAuth, asyncHandler(async (request, response) => {
  const result = await query(
    `
      SELECT id, full_name, email, role, avatar_url, total_water_saved_liters, total_co2_diverted_kg, created_at
      FROM users
      WHERE id = $1
    `,
    [request.auth.userId],
  );

  if (result.rowCount === 0) {
    throw new HttpError(404, 'User was not found.');
  }

  response.json({
    user: sanitizeUser(result.rows[0]),
  });
}));

export { authRouter };

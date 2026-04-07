import bcrypt from 'bcryptjs';
import { Router } from 'express';

import { asyncHandler } from '../lib/async-handler.js';
import { createAccessToken, requireAuth } from '../lib/auth.js';
import { HttpError } from '../lib/http-error.js';
import { User } from '../models/user.model.js';
import { mapUser } from '../utils/mappers.js';

const authRouter = Router();

authRouter.post('/signup', asyncHandler(async (request, response) => {
  const { email, fullName, password, role } = request.body || {};

  if (!fullName || !email || !password || !role) {
    throw new HttpError(400, 'Full name, email, password, and account role are required.');
  }

  if (!['buyer', 'seller'].includes(role)) {
    throw new HttpError(400, 'Role must be buyer or seller.');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() }).select('_id');

  if (existingUser) {
    throw new HttpError(409, 'An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    email: email.toLowerCase(),
    fullName,
    passwordHash,
    role,
  });

  const mappedUser = mapUser(user);

  response.status(201).json({
    token: createAccessToken(mappedUser),
    user: mappedUser,
  });
}));

authRouter.post('/login', asyncHandler(async (request, response) => {
  const { email, password } = request.body || {};

  if (!email || !password) {
    throw new HttpError(400, 'Email and password are required.');
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new HttpError(401, 'Invalid email or password.');
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    throw new HttpError(401, 'Invalid email or password.');
  }

  const mappedUser = mapUser(user);

  response.json({
    token: createAccessToken(mappedUser),
    user: mappedUser,
  });
}));

authRouter.get('/me', requireAuth, asyncHandler(async (request, response) => {
  const user = await User.findById(request.auth.userId);

  if (!user) {
    throw new HttpError(404, 'User was not found.');
  }

  response.json({ user: mapUser(user) });
}));

export { authRouter };

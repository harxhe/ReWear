import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { HttpError } from './http-error.js';

export function createAccessToken(user) {
  return jwt.sign(
    {
      email: user.email,
      sub: String(user.id),
    },
    env.jwtSecret,
    { expiresIn: '7d' },
  );
}

export function requireAuth(request, _response, next) {
  const header = request.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Authentication token is required.'));
  }

  try {
    const token = header.replace('Bearer ', '');
    const payload = jwt.verify(token, env.jwtSecret);
    request.auth = {
      userId: String(payload.sub),
    };
    next();
  } catch {
    next(new HttpError(401, 'Authentication token is invalid or expired.'));
  }
}

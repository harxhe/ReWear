import { query } from '../db/query.js';
import { HttpError } from '../lib/http-error.js';

export function requireAccountRole(allowedRoles) {
  return async (request, _response, next) => {
    const result = await query('SELECT role FROM users WHERE id = $1', [request.auth.userId]);

    if (result.rowCount === 0) {
      return next(new HttpError(404, 'User was not found.'));
    }

    const role = result.rows[0].role;
    request.auth.role = role;

    if (allowedRoles.includes(role)) {
      return next();
    }

    return next(new HttpError(403, `This action requires a ${allowedRoles.join(' or ')} account.`));
  };
}

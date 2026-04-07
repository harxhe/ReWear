import { User } from '../models/user.model.js';
import { HttpError } from '../lib/http-error.js';

export function requireAccountRole(allowedRoles) {
  return async (request, _response, next) => {
    const user = await User.findById(request.auth.userId).select('role');

    if (!user) {
      return next(new HttpError(404, 'User was not found.'));
    }

    request.auth.role = user.role;

    if (allowedRoles.includes(user.role)) {
      return next();
    }

    return next(new HttpError(403, `This action requires a ${allowedRoles.join(' or ')} account.`));
  };
}

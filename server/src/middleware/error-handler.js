import { HttpError } from '../lib/http-error.js';

export function errorHandler(error, _request, response, _next) {
  if (error instanceof HttpError) {
    return response.status(error.statusCode).json({
      details: error.details,
      error: error.message,
    });
  }

  console.error(error);

  return response.status(500).json({
    error: 'Something went wrong on the server.',
  });
}

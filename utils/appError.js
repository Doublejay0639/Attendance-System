/**
 * A custom Error subclass that carries an HTTP status code.
 * Instead of manually writing res.status(400).json(...) inside
 * every controller, we just `throw new AppError('message', 400)`
 * and let the central error handler in server.js turn it into
 * the right response. One place decides response shape, always.
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
import { AppError } from '../utils/appError.js';

/**
 * Returns an Express middleware that validates req.body against a
 * given Zod schema. On success, req.body is REPLACED with the
 * parsed result (trimmed, lowercased, type-checked per the schema) —
 * so everything downstream (controller, service) can trust its shape
 * completely and never has to re-check it.
 *
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return next(new AppError(firstIssue.message, 400));
  }

  req.body = result.data;
  next();
};
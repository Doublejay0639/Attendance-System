import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError.js';

/**
 * `protect` — verifies the JWT on incoming requests.
 * On success, attaches the decoded payload ({ id, role, iat, exp })
 * to req.user, so every downstream controller knows who's calling
 * without re-verifying anything.
 */
export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No token provided', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
};

/**
 * `authorize` — role-based access control.
 * Usage: router.post('/sessions', protect, authorize('lecturer'), createSession)
 * MUST run after `protect`, since it depends on req.user already
 * being set. Order matters here — swapping them would crash on
 * req.user being undefined.
 */
export const authorize =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
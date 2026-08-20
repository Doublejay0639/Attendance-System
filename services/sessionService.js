import User from '../models/User.js';
import Session from '../models/Session.js';
import { AppError } from '../utils/appError.js';

/**
 * Creates a new session.
 */
export const createSession = async (
  lecturerId,
  { courseName, courseCode, duration, requireFaceVerification }
) => {
  const lecturer = await User.findById(lecturerId).select('name');
  if (!lecturer) {
    // Edge case: token was valid, but the account no longer exists
    // (e.g. deleted between login and this request).
    throw new AppError('Lecturer account not found', 404);
  }

  const session = await Session.create({
    lecturerId,
    lecturerName: lecturer.name,
    courseName,
    courseCode,
    dateTime: new Date(),
    duration,
    status: 'active',
    requireFaceVerification: requireFaceVerification ?? true,
  });

  return session;
};
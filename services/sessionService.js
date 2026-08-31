import User from '../models/User.js';
import Session from '../models/Session.js';
import { AppError } from '../utils/appError.js';

/**
 * Creates a new session.
 */
export const createSession = async (
  lecturerId,
  { courseName, courseCode, location, duration, attendanceWindowMinutes, requireFaceVerification }
) => {
  const lecturer = await User.findById(lecturerId).select('name');
  if (!lecturer) {
    //token was valid, but the account no longer exists
    throw new AppError('Lecturer account not found', 404);
  }

  const dateTime = new Date();

  const attendanceClosesAt = new Date(
    dateTime.getTime() + attendanceWindowMinutes * 60 * 1000
  );

  const session = await Session.create({
    lecturerId,
    lecturerName: lecturer.name,
    courseName,
    courseCode,
    location,
    dateTime,
    duration,
    attendanceWindowMinutes,
    attendanceClosesAt,
    status: 'active',
    requireFaceVerification: requireFaceVerification ?? true,
  });

  return session;
};
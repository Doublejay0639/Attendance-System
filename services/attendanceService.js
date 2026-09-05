import mongoose from 'mongoose';
import Session from '../models/Session.js';
import Attendance from '../models/Attendance.js';
import { AppError } from '../utils/appError.js';
import { hashQrToken } from '../utils/qrToken.js';


export const scanQr = async (studentId, { sessionId, token }) => {
  if (!mongoose.isValidObjectId(sessionId)) {
    throw new AppError('Invalid session ID', 400);
  }

  // qrTokenHash has `select: false` in Session.js,
  // so we must explicitly request it here.
  const session = await Session.findById(sessionId).select('+qrTokenHash');

  if (!session) {
    throw new AppError('Session not found', 404);
  }

  if (session.status !== 'active') {
    throw new AppError('This attendance session is closed', 400);
  }

  // A lecturer may have created a session but not generated a QR yet.
  if (!session.qrTokenHash || !session.qrExpiresAt) {
    throw new AppError('No active QR code exists for this session', 400);
  }

  if (Date.now() >= session.qrExpiresAt.getTime()) {
    throw new AppError('QR code has expired', 400);
  }

  if (Date.now() >= session.attendanceClosesAt.getTime()) {
    throw new AppError('Attendance session has closed', 400);
  }

  const hashedToken = hashQrToken(token);

  if (hashedToken !== session.qrTokenHash) {
    throw new AppError('Invalid QR code', 400);
  }

  // Do not create another record if this student already scanned.
  const existingAttendance = await Attendance.findOne({
    sessionId,
    studentId,
  });

  if (existingAttendance) {
    throw new AppError(
      'You already have an attendance record for this session',
      409
    );
  }

  // Student gets five minutes to complete face verification.
  const faceVerificationDeadline = new Date(
    Date.now() + 300 * 1000
  );

  const attendance = await Attendance.create({
    sessionId,
    studentId,
    faceVerificationDeadline,
  });

  return {
    message:
      'QR scanned successfully. Verify your face to complete attendance.',

    attendance: {
      id: attendance._id,
      status: attendance.status,
      faceVerificationDeadline: attendance.faceVerificationDeadline,
    },

    session: {
      courseName: session.courseName,
      courseCode: session.courseCode,
      lecturerName: session.lecturerName,
      location: session.location,
      dateTime: session.dateTime,
    },
  };
};
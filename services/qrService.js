import QRCode from 'qrcode';
import mongoose from 'mongoose';
import Session from '../models/Session.js';
import { AppError } from '../utils/appError.js';
import { generateQrToken, hashQrToken } from '../utils/qrToken.js';

const QR_TOKEN_TTL_SECONDS = Number(
  process.env.QR_TOKEN_TTL_SECONDS || 60
);

/**
 * Generates a new temporary QR code for an active session.
 */
export const generateSessionQr = async (lecturerId, sessionId) => {
  if (!mongoose.isValidObjectId(sessionId)) {
    throw new AppError('Invalid session ID', 400);
  }

  const session = await Session.findOne({
    _id: sessionId,
    lecturerId,
  }).select('+qrTokenHash');

  if (!session) {
    throw new AppError('Session not found', 404);
  }

  if (session.status !== 'active') {
    throw new AppError('This attendance session is closed', 400);
  }


  if (Date.now() >= session.attendanceClosesAt.getTime()) {
    session.status = 'closed';
    await session.save();

    throw new AppError(
      'The attendance window has closed. No new QR can be generated.',
      400
    );
  }

  const token = generateQrToken();

  // The QR must not outlive the whole attendance session.
  const requestedQrExpiry = new Date(
    Date.now() + QR_TOKEN_TTL_SECONDS * 1000
  );

  const expiresAt =
    requestedQrExpiry < session.attendanceClosesAt
      ? requestedQrExpiry
      : session.attendanceClosesAt;

  // Save only the hash — never the real token.
  session.qrTokenHash = hashQrToken(token);
  session.qrExpiresAt = expiresAt;
  await session.save();

  // This is the only information encoded in the QR squares.
  const qrPayload = JSON.stringify({
    version: 1,
    sessionId: session._id.toString(),
    token,
  });

  const qrImageDataUrl = await QRCode.toDataURL(qrPayload, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 320,
  });

  return {
    qrImageDataUrl,
    expiresAt,
    refreshAfterSeconds: QR_TOKEN_TTL_SECONDS,

    // The frontend displays these beside/under the QR image.
    // they're not encoded into the QR itself.
    session: {
      id: session._id,
      courseName: session.courseName,
      courseCode: session.courseCode,
      lecturerName: session.lecturerName,
      location: session.location,
      dateTime: session.dateTime, 
      duration: session.duration,
      attendanceWindowMinutes: session.attendanceWindowMinutes,
      attendanceClosesAt: session.attendanceClosesAt,
    },
  };
};
import { asyncHandler } from '../utils/asyncHandler.js';
import * as sessionService from '../services/sessionService.js';
import * as qrService from '../services/qrService.js';

const toPublicSession = (session) => ({
  id: session._id,
  lecturerName: session.lecturerName,
  courseName: session.courseName,
  courseCode: session.courseCode,
  location: session.location,
  dateTime: session.dateTime,
  duration: session.duration,
  attendanceWindowMinutes: session.attendanceWindowMinutes,
  attendanceClosesAt: session.attendanceClosesAt,
  status: session.status,
  requireFaceVerification: session.requireFaceVerification,
});

// POST /api/sessions
export const createSession = asyncHandler(async (req, res) => {
  const session = await sessionService.createSession(req.user.id, req.body);

  res.status(201).json({
    session: toPublicSession(session),
  });
});

// POST /api/sessions/:sessionId/qr
export const generateSessionQr = asyncHandler(async (req, res) => {
  const qr = await qrService.generateSessionQr(
    req.user.id,
    req.params.sessionId
  );

  res.status(200).json(qr);
});
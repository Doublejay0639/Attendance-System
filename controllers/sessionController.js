import { asyncHandler } from '../utils/asyncHandler.js';
import * as sessionService from '../services/sessionService.js';

const toPublicSession = (session) => ({
  id: session._id,
  lecturerName: session.lecturerName,
  courseName: session.courseName,
  courseCode: session.courseCode,
  dateTime: session.dateTime,
  duration: session.duration,
  status: session.status,
  requireFaceVerification: session.requireFaceVerification,
});

// POST /api/sessions
// By the time this runs: `protect` has verified the JWT and set
// req.user, `authorize('lecturer')` has confirmed req.user.role is
// 'lecturer', and `validate(createSessionSchema)` has confirmed
// req.body is well-formed. This controller just orchestrates.
export const createSession = asyncHandler(async (req, res) => {
  const session = await sessionService.createSession(req.user.id, req.body);
  res.status(201).json({ session: toPublicSession(session) });
});
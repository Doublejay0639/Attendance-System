import { asyncHandler } from '../utils/asyncHandler.js';
import * as attendanceService from '../services/attendanceService.js';

// POST /api/attendance/scan
export const scanQr = asyncHandler(async (req, res) => {
  const userId = req.user.id
  const { sessionId, token } = req.body
  const result = await attendanceService.scanQr(userId, {sessionId, token});
  
  // const result = await attendanceService.scanQr(
  //   req.user.id,
  //   req.body
  // );

  res.status(201).json(result);
});
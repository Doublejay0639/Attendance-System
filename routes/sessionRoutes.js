import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { createSessionSchema } from '../schemas/sessionSchema.js';
import {
  createSession,
  generateSessionQr,
} from '../controllers/sessionController.js';

const router = Router();

// Lecturer creates the class and attendance window.
router.post(
  '/',
  protect,
  authorize('lecturer'),
  validate(createSessionSchema),
  createSession
);

// Lecturer requests a fresh QR every 55 seconds from the frontend.
router.post(
  '/:sessionId/qr',
  protect,
  authorize('lecturer'),
  generateSessionQr
);

export default router;
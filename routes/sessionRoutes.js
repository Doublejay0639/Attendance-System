import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { createSessionSchema } from '../schemas/sessionSchema.js';
import { createSession } from '../controllers/sessionController.js';

const router = Router();

// protect runs FIRST (verifies JWT, sets req.user), THEN authorize
// checks req.user.role 
router.post(
  '/',
  protect,
  authorize('lecturer'),
  validate(createSessionSchema),
  createSession
);

export default router;
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validateMiddleware.js';
import {
  studentRegisterSchema,
  lecturerRegisterSchema,
  loginSchema,
  verifyEmailSchema,
  resendOtpSchema,
} from '../schemas/authSchema.js';
import {
  registerStudent,
  registerLecturer,
  verifyEmail,
  resendOtp,
  login,
} from '../controllers/authController.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  '/register/student',
  authLimiter,
  validate(studentRegisterSchema),
  registerStudent
);
router.post(
  '/register/lecturer',
  authLimiter,
  validate(lecturerRegisterSchema),
  registerLecturer
);
router.post('/verify-email', authLimiter, validate(verifyEmailSchema), verifyEmail);
router.post('/resend-otp', authLimiter, validate(resendOtpSchema), resendOtp);
router.post('/login', authLimiter, validate(loginSchema), login);

export default router;
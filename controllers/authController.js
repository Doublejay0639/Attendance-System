import { asyncHandler } from '../utils/asyncHandler.js';
import * as authService from '../services/authService.js';

const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

/**
 * Factory that builds a register handler fixed to one role.
 * The role is baked in at ROUTE DEFINITION time (see auth.routes.js),
 * never read from the request body — that's what makes /register/student
 * and /register/lecturer safe from role self-assignment.
 */
const createRegisterHandler = (role) =>
  asyncHandler(async (req, res) => {
    const { user } = await authService.registerUser(role, req.body);
    res.status(201).json({
      message: 'Registration successful. Check your email for a verification code.',
      user: toPublicUser(user),
    });
  });

// POST /api/auth/register/student
export const registerStudent = createRegisterHandler('student');

// POST /api/auth/register/lecturer
export const registerLecturer = createRegisterHandler('lecturer');

// POST /api/auth/verify-email
export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const { user, token } = await authService.verifyEmail(email, otp);
  res.status(200).json({ token, user: toPublicUser(user) });
});

// POST /api/auth/resend-otp
export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await authService.resendOtp(email);
  // Deliberately generic — never confirms whether the email exists.
  res.status(200).json({
    message: 'If an account with that email exists and is unverified, a new code has been sent.',
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.loginUser(email, password);
  res.status(200).json({ token, user: toPublicUser(user) });
});
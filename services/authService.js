import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Lecturer from '../models/Lecturer.js';
import EmailVerification from '../models/emailVerification.js';
import { AppError } from '../utils/appError.js';
import { generateOtp, hashOtp, otpMatches, getOtpExpiry } from '../utils/otp.js';
import { sendOtpEmail } from './mailService.js';

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

const MAX_OTP_ATTEMPTS = 5;

export const hashPassword = (plainPassword) => bcrypt.hash(plainPassword, SALT_ROUNDS);

export const comparePassword = (plainPassword, hash) => bcrypt.compare(plainPassword, hash);

export const generateToken = (user) => {
  const expiresIn =
    user.role === 'lecturer'
      ? process.env.JWT_LECTURER_EXPIRY
      : process.env.JWT_STUDENT_EXPIRY;

  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

/**
 * Generates a fresh OTP and (upsert) writes it to this user's
 * EmailVerification record, resetting `attempts` back to 0.
 * upsert:true matters here — without it, calling this a second time
 * (e.g. via resend) would collide with the unique index on userId
 * and throw a duplicate key error instead of just replacing the code.
 */
const issueAndSendOtp = async (user) => {
  const otp = generateOtp();

  await EmailVerification.findOneAndUpdate(
    { userId: user._id },
    { otpHash: hashOtp(otp), expiresAt: getOtpExpiry(), attempts: 0 },
    { upsert: true, new: true }
  );

  await sendOtpEmail(user.email, otp);
};

/**
 * Registers a new user for a given role. `role` is passed in
 * explicitly by the controller based on which endpoint was hit
 * (/register/student vs /register/lecturer) — it is NEVER taken
 * from the request body, so a client can't self-assign a role.
 */
export const registerUser = async (
  role,
  { name, email, password, department, matricNo, staffNo }
) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError(
      existing.emailVerified
        ? 'An account with this email already exists'
        : 'An account with this email already exists but is not verified. Use /resend-otp to get a new code.',
      409
    );
  }

  const passwordHash = await hashPassword(password);

  const user =
    role === 'student'
      ? await Student.create({ name, email, passwordHash, department, matricNo })
      : await Lecturer.create({ name, email, passwordHash, department, staffNo });

  await issueAndSendOtp(user);

  return { user };
};

/**
 * Confirms a submitted OTP. On success: marks the account verified,
 * deletes the EmailVerification record entirely (nothing left to
 * reuse or brute-force), and issues a JWT — the user ends up logged
 * in immediately as the final step of registration.
 *
 * On a WRONG code: increments `attempts` and re-saves. After
 * MAX_OTP_ATTEMPTS wrong guesses, the record is deleted outright —
 * the user must request a brand new OTP via /resend-otp rather than
 * being allowed to keep guessing against the same code forever.
 */
export const verifyEmail = async (email, otp) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('No pending verification found for this email', 400);
  }
  if (user.emailVerified) {
    throw new AppError('This email is already verified', 400);
  }

  const record = await EmailVerification.findOne({ userId: user._id });
  if (!record) {
    throw new AppError('No pending verification found for this email', 400);
  }

  if (record.expiresAt.getTime() < Date.now()) {
    await record.deleteOne();
    throw new AppError('OTP has expired. Request a new one via /resend-otp', 400);
  }

  if (!otpMatches(otp, record.otpHash)) {
    record.attempts += 1;

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      await record.deleteOne();
      throw new AppError('Too many incorrect attempts. Request a new OTP via /resend-otp', 429);
    }

    await record.save();
    throw new AppError('Incorrect OTP', 400);
  }

  user.emailVerified = true;
  await user.save();
  await record.deleteOne();

  const token = generateToken(user);
  return { user, token };
};

/**
 * Issues a new OTP for an unverified account. Always no-ops silently
 * if the email doesn't exist or is already verified — same
 * email-enumeration protection as login. The controller always sends
 * back the same generic message regardless of what happened here.
 */
export const resendOtp = async (email) => {
  const user = await User.findOne({ email });
  if (!user || user.emailVerified) return;
  await issueAndSendOtp(user);
};

/**
 * Logs a user in. Checks the PASSWORD first, before checking whether
 * the email is verified. If verification status were checked first,
 * anyone who merely guesses a real registered email — without
 * knowing the password — could learn "this account exists but isn't
 * verified." Proving the password first means only the account's
 * actual owner ever sees that message.
 */
export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.emailVerified) {
    throw new AppError(
      'Please verify your email before logging in. Request a new code via /resend-otp if needed.',
      403
    );
  }

  const token = generateToken(user);
  return { user, token };
};
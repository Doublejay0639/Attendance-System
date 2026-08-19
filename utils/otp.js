import crypto from 'crypto';

/**
 * Generates a 6-digit numeric OTP as a string, e.g. "004821".
 * crypto.randomInt is cryptographically secure — Math.random() is
 * NOT safe for anything security-relevant like this; it's predictable.
 */

export const generateOtp = () => {
  return crypto
    .randomInt(0, 1_000_000)
    .toString()
    .padStart(6, '0');
};


/**
 * Hashes an OTP with SHA-256 before it's stored.
 *
 * Deliberately NOT bcrypt here, unlike passwords. bcrypt is slow on
 * purpose, to resist offline brute-forcing of a long-lived secret.
 * An OTP is short-lived (minutes) and already low-entropy (6 digits,
 * ~1,000,000 possibilities) — a slow hash barely helps. What actually
 * protects it is short expiry + a capped number of guesses (see the
 * `attempts` lockout in EmailVerification) — not the hash algorithm.
 * SHA-256 (fast) is the right tool here.
 */
export const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

export const otpMatches = (plainOtp, hash) => hashOtp(plainOtp) === hash;

export const getOtpExpiry = () => {
  const minutes = Number(process.env.OTP_EXPIRY_MINUTES) || 10;
  return new Date(Date.now() + minutes * 60 * 1000);
};
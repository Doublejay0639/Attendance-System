import crypto from 'crypto';

/**
 * Generates a secure, unguessable QR token.
 * This original token goes into the QR code.
 */
export const generateQrToken = () => {
  return crypto.randomBytes(32).toString('base64url');
};

/**
 * Hashes a QR token before it is saved in the DB
 */
export const hashQrToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
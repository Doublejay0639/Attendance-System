import nodemailer from 'nodemailer';

const hasSmtpConfig = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter = null;
if (hasSmtpConfig()) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

/**
 * Sends the OTP email. If SMTP isn't configured yet (e.g. early local
 * dev, before you've set up a real mail provider), this falls back to
 * logging the OTP to the console instead of throwing — so the full
 * register -> verify flow stays testable without email infra blocking
 * you on day one of a two-week build.
 *
 * IMPORTANT: this console fallback is a development convenience only.
 * Before deploying anywhere real, SMTP_HOST/USER/PASS must be set in
 * .env, or students will never actually receive a code.
 */
export const sendOtpEmail = async (to, otp) => {
  if (!transporter) {
    console.log(`[DEV MODE — no SMTP configured] OTP for ${to}: ${otp}`);
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'Verify your email — Attendance System',
    text: `Your verification code is ${otp}. It expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.`,
  });
};
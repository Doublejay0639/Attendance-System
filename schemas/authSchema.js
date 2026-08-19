import { z } from 'zod';

const STUDENT_EMAIL_DOMAIN = process.env.STUDENT_EMAIL_DOMAIN;
const LECTURER_EMAIL_DOMAIN = process.env.LECTURER_EMAIL_DOMAIN;

/**
 * Builds an email validator scoped to one role's institutional domain.
 * If the relevant env var isn't set, the domain check is skipped
 * rather than rejecting everything — keeps early local dev unblocked
 * before you've configured real domains.
 */
const institutionalEmail = (domain, roleLabel) =>
  z
    .string()
    .trim()
    .toLowerCase()
    .email('must be a valid email')
    .refine((email) => email.endsWith(`@${domain.toLowerCase()}`), {
      message: domain
        ? `${roleLabel} must use an institutional email ending in @${domain}`
        : 'invalid email domain',
    });

const baseFields = {
  name: z.string().trim().min(1, 'name is required'),
  password: z.string().min(8, 'password must be at least 8 characters'),
  department: z.string().trim().optional(),
};

// Note: no `role` field on either schema. The endpoint itself
// (/register/student vs /register/lecturer) determines the role —
// we never trust a client-supplied role value.
export const studentRegisterSchema = z.object({
  ...baseFields,
  email: institutionalEmail(STUDENT_EMAIL_DOMAIN, 'Students'),
  matricNo: z.string().trim().min(1, 'matricNo is required for student accounts'),
});

export const lecturerRegisterSchema = z.object({
  ...baseFields,
  email: institutionalEmail(LECTURER_EMAIL_DOMAIN, 'Lecturers'),
  staffNo: z.string().trim().min(1, 'staffNo is required for lecturer accounts'),
});

// Login is NOT domain-restricted — anyone who successfully registered
// already passed that check once. Re-checking here just adds friction
// without adding security.
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('must be a valid email'),
  password: z.string().min(1, 'password is required'),
});

export const verifyEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email('must be a valid email'),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be a 6-digit code'),
});

export const resendOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email('must be a valid email'),
});























// import { z } from 'zod';

// /**
//  * Fields every registering user shares, regardless of role.
//  */
// const baseFields = {
//   name: z.string().trim().min(1, 'name is required'),
//   email: z.string().trim().toLowerCase().email('must be a valid email'),
//   password: z.string().min(8, 'password must be at least 8 characters'),
//   department: z.string().trim().optional(),
// };

// const studentRegisterSchema = z.object({
//   ...baseFields,
// //   role: z.literal('student'),
//   matricNo: z.string().trim().min(1, 'matricNo is required for student accounts'),
// }).refine(
//   (data) => data.email.endsWith('@student.funaab.edu.ng'),
//   {
//     message: 'Lecturers must use their institutional email',
//     path: ['email'],
//   }
// );

// const lecturerRegisterSchema = z.object({
//   ...baseFields,
// //   role: z.literal('lecturer'),
//   staffNo: z.string().trim().min(1, 'staffNo is required for lecturer accounts'),
// }).refine(
//   (data) => data.email.endsWith('@funaab.edu.ng'),
//   {
//     message: 'Lecturers must use their institutional email',
//     path: ['email'],
//   }
// );

// /**
//  * discriminatedUnion picks WHICH schema to validate against based on
//  * the `role` field. 
//  */
// export const registerSchema = z.discriminatedUnion('role', [
//   studentRegisterSchema,
//   lecturerRegisterSchema,
// ]);

// export const loginSchema = z.object({
//   email: z.string().trim().toLowerCase().email('must be a valid email'),
//   password: z.string().min(1, 'password is required'),
// });
import { z } from 'zod';

export const createSessionSchema = z
  .object({
    courseName: z.string().trim().min(1, 'courseName is required'),

    courseCode: z.string().trim().min(1, 'courseCode is required'),

    location: z.string().trim().min(1, 'location is required'),

    // Entire class length.
    duration: z.coerce
      .number()
      .int('duration must be a whole number')
      .min(1, 'duration must be at least 1 minute')
      .max(360, 'duration cannot exceed 360 minutes'),

    // Period students may scan the rotating QR code.
    attendanceWindowMinutes: z.coerce
      .number()
      .int('attendanceWindowMinutes must be a whole number')
      .min(1, 'attendanceWindowMinutes must be at least 1 minute')
      .max(60, 'attendanceWindowMinutes cannot exceed 60 minutes'),

    requireFaceVerification: z.boolean().optional(),
  })
  .strict();
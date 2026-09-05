import { z } from 'zod';

export const scanQrSchema = z.object({
  sessionId: z.string().trim().regex(/^[a-fA-F0-9]{24}$/, 'sessionId must be a valid MongoDB ID'),
  token: z.string().trim().min(1, 'token is required').max(200, 'token is invalid'),
}).strict();

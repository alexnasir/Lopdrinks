import { z } from 'zod';

export const verifySchema = z.object({
  email: z.string().email('Enter a valid email address'),
  otp: z.string().min(1, 'OTP is required'),
});

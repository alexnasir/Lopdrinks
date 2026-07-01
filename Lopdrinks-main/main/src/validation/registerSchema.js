import { z } from 'zod';
import { ROLES } from '../constants/roles';

export const registerSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum([ROLES.USER, ROLES.ADMIN]).default(ROLES.USER),
});

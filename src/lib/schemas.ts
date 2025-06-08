import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export type LoginFormData = z.infer<typeof LoginSchema>;

export const AdminFormSchema = z.object({
  id: z.string().optional(), // Optional for create, required for update
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  role: z.enum(['admin', 'superadmin'], { message: 'Invalid role selected.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }).optional(), // Optional for update
  confirmPassword: z.string().optional(),
}).refine(data => {
  // If password is provided, confirmPassword must match
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ['confirmPassword'], // path of error
});

export type AdminFormData = z.infer<typeof AdminFormSchema>;


export const UserRegistrationSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  // Add any other fields required for user registration
});

export type UserRegistrationFormData = z.infer<typeof UserRegistrationSchema>;

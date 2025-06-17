
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }), // Changed min from 6 to 1 for demo, can be adjusted
});

export type LoginFormData = z.infer<typeof LoginSchema>;

export const AdminFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  role: z.enum(['admin', 'superadmin'], { message: 'Invalid role selected.' }),
  password: z.string().optional(), // Password itself is optional at the object level
  confirmPassword: z.string().optional(),
}).superRefine((data, ctx) => {
  // Case 1: New admin (no id provided)
  if (!data.id) {
    if (!data.password || data.password.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password is required for new admins.',
        path: ['password'],
      });
    } else if (data.password.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: 8,
        type: 'string',
        inclusive: true,
        message: 'Password must be at least 8 characters.',
        path: ['password'],
      });
    }
    if (data.password && data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords don't match.",
        path: ['confirmPassword'],
      });
    }
  }
  // Case 2: Existing admin (id is provided) - password change is optional
  else if (data.id && data.password) { // Only validate if password is provided for an update
    if (data.password.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: 8,
        type: 'string',
        inclusive: true,
        message: 'Password must be at least 8 characters.',
        path: ['password'],
      });
    }
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords don't match.",
        path: ['confirmPassword'],
      });
    }
  }

  // If only confirmPassword is provided without a new password (for existing or new)
  // This check should ideally be if password has content, then confirmPassword is needed
  // The above checks cover password matching. This handles confirmPassword existing without password.
  if (data.confirmPassword && (!data.password || data.password.length === 0)) {
     if (!data.id) { // For new admin, password would be required anyway by above.
        // This is mostly for edit case if user types in confirm but not new password.
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Enter the new password first if you want to confirm it.',
            path: ['password'],
          });
     } else if (data.id && data.password && data.password.length > 0){
        // This scenario is fine, means they are changing password.
     } else if (data.id && (!data.password || data.password.length === 0)) {
        // Editing, password field empty, but confirmPassword is not.
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'To change password, enter new password first.',
            path: ['password'],
          });
     }
  }
});

export type AdminFormData = z.infer<typeof AdminFormSchema>;


export const UserRegistrationSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  // Add any other fields required for user registration
});

export type UserRegistrationFormData = z.infer<typeof UserRegistrationSchema>;

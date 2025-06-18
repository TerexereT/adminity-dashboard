
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export type LoginFormData = z.infer<typeof LoginSchema>;

export const AdminFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  role: z.enum(['admin', 'superadmin'], { message: 'Invalid role selected.' }),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).superRefine((data, ctx) => {
  const isEditing = !!data.id;
  const passwordProvided = data.password && data.password.length > 0;
  const confirmPasswordProvided = data.confirmPassword && data.confirmPassword.length > 0;

  if (!isEditing) { // Logic for new admin
    if (!passwordProvided) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password is required for new admins.',
        path: ['password'],
      });
    } else if (data.password!.length < 8) { // Assertion: passwordProvided is true
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: 8,
        type: 'string',
        inclusive: true,
        message: 'Password must be at least 8 characters.',
        path: ['password'],
      });
    }
    if (passwordProvided && data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords don't match.",
        path: ['confirmPassword'],
      });
    }
  } else { // Logic for editing an existing admin
    if (passwordProvided) { // If user intends to change password
      if (data.password!.length < 8) { // Assertion: passwordProvided is true
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 8,
          type: 'string',
          inclusive: true,
          message: 'New password must be at least 8 characters.',
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
    } else if (confirmPasswordProvided && !passwordProvided) {
      // User typed in confirmPassword but left new password blank
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please enter the new password as well if you intend to change it. Leave both blank to keep the current password.',
        path: ['password'],
      });
    }
  }
});

export type AdminFormData = z.infer<typeof AdminFormSchema>;


export const UserRegistrationSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }).optional().or(z.literal('')),
  phone: z.string().min(1, { message: 'Phone number is required.' }),
  userType: z.number({
    required_error: "User type is required.",
    invalid_type_error: "User type must be a number.",
  })
  .int({ message: "User type must be a whole number." })
  .min(0, { message: "User type must be 0, 1, or 2." })
  .max(2, { message: "User type must be 0, 1, or 2." }),
});

export type UserRegistrationFormData = z.infer<typeof UserRegistrationSchema>;

export const ProcessDocumentSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
});
export type ProcessDocumentFormData = z.infer<typeof ProcessDocumentSchema>;

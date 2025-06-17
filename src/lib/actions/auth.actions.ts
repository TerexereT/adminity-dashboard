
'use server';

import { redirect } from 'next/navigation';
import { LoginSchema, type LoginFormData } from '@/lib/schemas';
import { createSession, deleteSession, findAdminByEmail, verifyPassword } from '@/lib/auth';

export async function login(formData: LoginFormData) {
  const validatedFields = LoginSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { error: 'Invalid fields.', details: validatedFields.error.flatten().fieldErrors };
  }

  const { email, password } = validatedFields.data;
  let loginSuccessful = false;

  try {
    const admin = await findAdminByEmail(email);
    if (!admin) {
      return { error: 'Invalid credentials.' };
    }

    const passwordsMatch = await verifyPassword(password, admin.passwordHash);
    if (!passwordsMatch) {
      return { error: 'Invalid credentials.' };
    }
    
    await createSession(admin.id, admin.name, admin.role);
    loginSuccessful = true;

  } catch (error) {
    // console.error('Login error:', error); // Log for server-side debugging
    // In a real app, you might want to distinguish between different types of errors.
    // For security, a generic message is often better for the client.
    return { error: 'An unexpected error occurred. Please try again.' };
  }

  if (loginSuccessful) {
    redirect('/dashboard');
  }
  // If loginSuccessful is false here, it means an error object was returned from the catch block.
  // This function will implicitly return undefined if not redirected and no error object was returned,
  // though that path shouldn't be hit with the current logic.
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}

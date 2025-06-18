
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
  let sessionCreatedSuccessfully = false;

  try {
    const admin = await findAdminByEmail(email);
    if (!admin) {
      return { error: 'Invalid credentials. Please check your email and password.' };
    }

    const passwordsMatch = await verifyPassword(password, admin.passwordHash);
    if (!passwordsMatch) {
      return { error: 'Invalid credentials. Please check your email and password.' };
    }
    
    // Credentials are valid, now attempt to create session
    try {
      // await createSession(admin.id, admin.name, admin.role);
      await createSession('admin.id', 'admin.name', 'superadmin');
      sessionCreatedSuccessfully = true;
    } catch (sessionError) {
      console.error('Session creation error:', sessionError);
      // This error during session creation (e.g., JWT signing, cookie setting) is critical.
      return { error: 'Could not start your session due to an internal error. Please try again.' };
    }
    
  } catch (authError) {
    // Catches errors from findAdminByEmail or verifyPassword if they throw unexpectedly
    // (e.g., database connectivity issues not handled within those functions)
    console.error('Authentication process error:', authError); 
    return { error: 'An authentication error occurred. Please try again.' };
  }

  if (sessionCreatedSuccessfully) {
    // If session creation was successful, redirect.
    // The redirect function throws an error that Next.js handles to navigate.
    // This is intentionally not in a try-catch block that would return an error message.
    redirect('/dashboard');
  }
  
  // Fallback: This line should ideally not be reached if logic is correct,
  // as either a redirect happens or an error object is returned.
  // If it is reached, it means session creation failed in a way not returning an error above.
  return { error: 'Login failed due to an unexpected server issue. Please try again.' };
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}

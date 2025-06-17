
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

// Ensure that if JWT_SECRET_KEY is an empty string, we still use the fallback.
const envSecret = process.env.JWT_SECRET_KEY;
const fallbackSecret = "default-secret-key-for-adminity-app"; // Replace with a strong secret from env variables
const secretKey = (typeof envSecret === 'string' && envSecret.length > 0) ? envSecret : fallbackSecret;

const key = new TextEncoder().encode(secretKey);

const SESSION_COOKIE_NAME = 'adminity_session';

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h') // Token expires in 1 hour
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    // console.error("JWT decryption/validation error:", error); // Log for debugging
    return null; // Or throw specific error
  }
}

export async function createSession(userId: string, userName: string, userRole: 'admin' | 'superadmin') {
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
  const session = await encrypt({ userId, userName, userRole, expires });

  cookies().set(SESSION_COOKIE_NAME, session, { expires, httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });
}

export async function getSession() {
  // Addressing the runtime error: "cookies() should be awaited before using its value"
  const cookieStore = await cookies(); 
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;
  return await decrypt(sessionCookie);
}

export async function deleteSession() {
  cookies().delete(SESSION_COOKIE_NAME);
}

// Mock user data for login
// The password for this user is "password"
const MOCK_ADMIN_USER = {
  id: 'superadmin001',
  email: 'admin@example.com',
  passwordHash: '$2b$10$Gl9L3u0j1J2t.l8qKkDcGeiQ9s8jR7xY0zWc3VbA6sD4eF5gH6iI.', // Hash for "password"
  name: 'Super Admin',
  role: 'superadmin' as 'superadmin' | 'admin',
};

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function findAdminByEmail(email: string) {
  // In a real app, query your database for the user by email.
  // For this demo, we check against the mock user and users in Firestore.

  // Check mock user first (e.g., a built-in super admin)
  if (email === MOCK_ADMIN_USER.email) {
    return MOCK_ADMIN_USER;
  }
  
  // If not the mock user, this is where you would typically query Firestore.
  // However, the current admin management page directly queries Firestore.
  // For the login action, we need a way to get a user from Firestore by email.
  // This part needs to be implemented if admins from Firestore are to log in
  // via this generic findAdminByEmail function.
  // For now, login will only work for the MOCK_ADMIN_USER.
  // To enable login for Firestore admins, you'd query the 'admins' collection here.
  // Example (conceptual, db instance needs to be available here or passed):
  // import { db } from '@/lib/firebase'; // Potentially causes issues in this file if db init is complex
  // import { collection, query, where, getDocs } from 'firebase/firestore';
  // const adminsRef = collection(db, 'admins');
  // const q = query(adminsRef, where('email', '==', email));
  // const querySnapshot = await getDocs(q);
  // if (!querySnapshot.empty) {
  //   const adminDoc = querySnapshot.docs[0];
  //   return { id: adminDoc.id, ...adminDoc.data() } as typeof MOCK_ADMIN_USER;
  // }

  return null;
}

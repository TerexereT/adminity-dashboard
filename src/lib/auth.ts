
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

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
  const sessionCookie = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;
  return await decrypt(sessionCookie);
}

export async function deleteSession() {
  cookies().delete(SESSION_COOKIE_NAME);
}

// Mock user data for login
const MOCK_ADMIN_USER = {
  id: 'superadmin001',
  email: 'admin@example.com',
  passwordHash: '$2b$10$fakedPasswordHashForDemo', // This would be a real bcrypt hash
  name: 'Super Admin',
  role: 'superadmin' as 'superadmin' | 'admin',
};

// In a real app, use a secure password hashing library like bcrypt
// For this example, we'll do a simple string comparison.
// IMPORTANT: This is NOT secure and for demonstration purposes only.
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // In a real app: return await bcrypt.compare(password, hash);
  if (password === 'password' && hash === MOCK_ADMIN_USER.passwordHash) { // Simple check for demo
      return true;
  }
  return false;
}

export async function findAdminByEmail(email: string) {
  // In a real app, query your database
  if (email === MOCK_ADMIN_USER.email) {
    return MOCK_ADMIN_USER;
  }
  return null;
}

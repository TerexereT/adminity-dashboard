
'use server';

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, type DocumentData } from 'firebase/firestore';
import type { Admin } from '@/lib/types';

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
  (await cookies()).delete(SESSION_COOKIE_NAME);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function findAdminByEmail(email: string): Promise<Pick<Admin, 'id' | 'name' | 'email' | 'role' | 'passwordHash'> | null> {
  try {
    const adminsRef = collection(db, 'Admins');
    const q = query(adminsRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    // Assuming email is unique, so we take the first document.
    const adminDoc = querySnapshot.docs[0];
    const adminData = adminDoc.data() as DocumentData;

    // Ensure all necessary fields are present for login
    if (!adminData.name || !adminData.email || !adminData.role || !adminData.passwordHash) {
        console.error('Admin data missing required fields for login:', adminDoc.id, adminData);
        return null;
    }

    return {
      id: adminDoc.id,
      name: adminData.name,
      email: adminData.email,
      role: adminData.role as 'admin' | 'superadmin',
      passwordHash: adminData.passwordHash,
    };
  } catch (error) {
    console.error("Error fetching admin by email from Firestore: ", error);
    return null;
  }
}

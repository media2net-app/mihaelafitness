import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import type { AuthPayload } from '@/lib/authRequest';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function getAuthFromCookie(): Promise<{
  token: string;
  payload: AuthPayload;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    return { token, payload };
  } catch {
    return null;
  }
}

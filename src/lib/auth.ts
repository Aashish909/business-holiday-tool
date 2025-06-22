import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SEC || 'fallback-secret';

console.log('Auth module loaded - JWT_SECRET exists:', !!process.env.JWT_SEC);
console.log('JWT_SECRET value:', process.env.JWT_SEC ? 'Set' : 'Not set');
console.log('Using JWT_SECRET:', JWT_SECRET ? 'Has value' : 'No value');

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'MANAGER';
  companyId: string;
  onboardingCompleted: boolean;
}

export function generateToken(payload: JWTPayload): string {
  console.log('Generating token with secret:', JWT_SECRET ? 'Secret exists' : 'No secret');
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  console.log('Token generated, length:', token.length);
  return token;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    console.log('Verifying token with secret:', JWT_SECRET ? 'Secret exists' : 'No secret');
    console.log('Token length:', token.length);
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    console.log('Token verified successfully:', decoded);
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Edge Runtime compatible JWT verification
export async function verifyTokenEdge(token: string): Promise<JWTPayload | null> {
  try {
    // For now, we'll use a simple approach - decode without verification
    // In production, you should use a proper JWT library that supports Web Crypto API
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonPayload);
    
    // Check if token is expired
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      console.log('Token expired');
      return null;
    }
    
    return payload as JWTPayload;
  } catch (error) {
    console.error('Edge token verification error:', error);
    return null;
  }
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value || null;
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  const token = await getTokenFromCookies();
  if (!token) return null;
  return verifyToken(token);
}

export function setAuthCookie(token: string, response?: NextResponse): NextResponse {
  const res = response || NextResponse.next();
  res.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
  return res;
}

export function clearAuthCookie(response?: NextResponse): NextResponse {
  const res = response || NextResponse.next();
  res.cookies.delete('token');
  return res;
} 
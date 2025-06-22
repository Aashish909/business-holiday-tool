import { NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth';

export async function GET() {
  const testPayload = {
    userId: 'test-user-id',
    email: 'test@example.com',
    role: 'ADMIN' as const,
    companyId: 'test-company-id',
    onboardingCompleted: true,
  };

  const token = generateToken(testPayload);

  return NextResponse.json({
    message: 'JWT test endpoint',
    token,
    payload: testPayload,
  });
} 
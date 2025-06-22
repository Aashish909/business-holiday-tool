import { NextRequest, NextResponse } from 'next/server';
import { generateToken, verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('Test JWT API called');
    console.log('JWT_SEC exists:', !!process.env.JWT_SEC);
    
    // Test token generation
    const testPayload = {
      userId: 'test-user',
      email: 'test@example.com',
      role: 'EMPLOYEE' as const,
      companyId: 'test-company',
      onboardingCompleted: false,
    };
    
    console.log('Generating test token...');
    const token = generateToken(testPayload);
    console.log('Token generated, length:', token.length);
    
    // Test token verification
    console.log('Verifying test token...');
    const verified = verifyToken(token);
    console.log('Token verified:', !!verified);
    
    return NextResponse.json({
      success: true,
      jwtSecretExists: !!process.env.JWT_SEC,
      tokenGenerated: !!token,
      tokenLength: token.length,
      tokenVerified: !!verified,
      verifiedPayload: verified,
    });
  } catch (error) {
    console.error('JWT test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      jwtSecretExists: !!process.env.JWT_SEC,
    });
  }
} 
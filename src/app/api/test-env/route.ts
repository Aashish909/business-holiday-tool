import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    JWT_SEC: process.env.JWT_SEC ? 'Set' : 'Not set',
    JWT_SEC_LENGTH: process.env.JWT_SEC ? process.env.JWT_SEC.length : 0,
    NODE_ENV: process.env.NODE_ENV,
    allEnvVars: Object.keys(process.env).filter(key => key.includes('JWT'))
  });
} 
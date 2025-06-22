import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Environment test endpoint',
    env: {
      JWT_SEC: process.env.JWT_SEC ? 'Set' : 'Not set',
      MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
      NODE_ENV: process.env.NODE_ENV,
    }
  });
} 
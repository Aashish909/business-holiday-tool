import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getRequestsByUserId, findUserById } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [requests, dbUser] = await Promise.all([
      getRequestsByUserId(user.userId),
      findUserById(user.userId),
    ]);

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const totalRequests = requests.length;
    const approvedRequests = requests.filter(
      (request) => request.status === "APPROVED"
    ).length;
    const pendingRequests = requests.filter(
      (request) => request.status === "PENDING"
    ).length;

    return NextResponse.json({
      totalRequests,
      approvedRequests,
      pendingRequests,
      availableDays: dbUser.availableDays,
    });
  } catch (error) {
    console.error('Error fetching employee dashboard data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
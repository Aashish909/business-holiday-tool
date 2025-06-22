import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  getCompanyById,
  countPendingRequests,
  countApprovedRequests,
  countEmployees,
} from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN" || !user.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [company, pendingRequests, approvedRequests, employeeCount] =
      await Promise.all([
        getCompanyById(user.companyId),
        countPendingRequests(user.companyId),
        countApprovedRequests(user.companyId),
        countEmployees(user.companyId),
      ]);

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({
      pendingRequests,
      approvedRequests,
      employeeCount,
      companyName: company.name,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { findUserById, getCompanyById, getCompanyHolidays } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "EMPLOYEE") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await findUserById(user.userId);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let company = null;
    let companyHolidays: unknown[] = [];

    if (dbUser.companyId) {
      const [companyData, holidaysData] = await Promise.all([
        getCompanyById(dbUser.companyId),
        getCompanyHolidays(dbUser.companyId)
      ]);
      
      company = companyData;
      companyHolidays = holidaysData;
    }

    return NextResponse.json({
      user: dbUser,
      company,
      companyHolidays,
    });
  } catch (error) {
    console.error('Error fetching employee profile data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
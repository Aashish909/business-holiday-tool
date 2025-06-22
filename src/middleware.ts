import { NextRequest, NextResponse } from 'next/server';
import { verifyTokenEdge } from '@/lib/auth';

const isPublicRoute = (pathname: string) => {
  return pathname === '/' || pathname.startsWith('/api/webhooks/') || 
         pathname.startsWith('/api/auth/') || pathname.startsWith('/api/test-') || 
         pathname === '/login' || pathname === '/register';
};

const isOnboardingRoute = (pathname: string) => {
  return pathname === '/onboarding';
};

const isAdminRoute = (pathname: string) => {
  return pathname.startsWith('/admin');
};

const isEmployeeRoute = (pathname: string) => {
  return pathname.startsWith('/employee');
};

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = req.cookies.get('token')?.value;

  // If no token and not a public route, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  const user = await verifyTokenEdge(token);

  if (!user) {
    // Invalid token, clear cookie and redirect to login
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete('token');
    return response;
  }

  // Handle onboarding flow
  if (!user.onboardingCompleted && !isOnboardingRoute(pathname)) {
    const onboardingUrl = new URL('/onboarding', req.url);
    return NextResponse.redirect(onboardingUrl);
  }

  if (user.onboardingCompleted && isOnboardingRoute(pathname)) {
    if (user.role === 'ADMIN') {
      const adminUrl = new URL('/admin', req.url);
      return NextResponse.redirect(adminUrl);
    } else {
      const employeeUrl = new URL('/employee', req.url);
      return NextResponse.redirect(employeeUrl);
    }
  }

  // Handle role-based access
  if (isAdminRoute(pathname)) {
    if (user.role === 'ADMIN') {
      return NextResponse.next();
    } else {
      const employeeUrl = new URL('/employee', req.url);
      return NextResponse.redirect(employeeUrl);
    }
  }

  if (isEmployeeRoute(pathname)) {
    if (user.role === 'EMPLOYEE') {
      return NextResponse.next();
    } else {
      const adminUrl = new URL('/admin', req.url);
      return NextResponse.redirect(adminUrl);
    }
  }

  // If user is authenticated and onboarding is completed, redirect to appropriate dashboard
  if (user.onboardingCompleted && pathname === '/') {
    if (user.role === 'ADMIN') {
      const adminUrl = new URL('/admin', req.url);
      return NextResponse.redirect(adminUrl);
    } else {
      const employeeUrl = new URL('/employee', req.url);
      return NextResponse.redirect(employeeUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
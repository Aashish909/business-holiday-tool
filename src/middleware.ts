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
  console.log('Middleware - pathname:', pathname);

  // Allow public routes
  if (isPublicRoute(pathname)) {
    console.log('Middleware - allowing public route');
    return NextResponse.next();
  }

  // Get token from cookies
  const token = req.cookies.get('token')?.value;
  console.log('Middleware - token exists:', !!token);
  console.log('Middleware - JWT_SEC exists:', !!process.env.JWT_SEC);
  console.log('Middleware - cookie names:', Array.from(req.cookies.getAll()).map(c => c.name));

  // If no token and not a public route, redirect to login
  if (!token) {
    console.log('Middleware - no token, redirecting to login');
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  console.log('Middleware - attempting to verify token...');
  console.log('Middleware - token value:', token.substring(0, 20) + '...');
  const user = await verifyTokenEdge(token);
  console.log('Middleware - user verified:', !!user, user ? { role: user.role, onboardingCompleted: user.onboardingCompleted } : null);

  if (!user) {
    // Invalid token, clear cookie and redirect to login
    console.log('Middleware - invalid token, redirecting to login');
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete('token');
    return response;
  }

  // Handle onboarding flow
  if (!user.onboardingCompleted && !isOnboardingRoute(pathname)) {
    console.log('Middleware - onboarding not completed, redirecting to onboarding');
    const onboardingUrl = new URL('/onboarding', req.url);
    return NextResponse.redirect(onboardingUrl);
  }

  if (user.onboardingCompleted && isOnboardingRoute(pathname)) {
    console.log('Middleware - onboarding completed, redirecting to dashboard');
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
      console.log('Middleware - admin accessing admin route');
      return NextResponse.next();
    } else {
      console.log('Middleware - non-admin accessing admin route, redirecting to employee');
      // Redirect employees to their dashboard instead of homepage
      const employeeUrl = new URL('/employee', req.url);
      return NextResponse.redirect(employeeUrl);
    }
  }

  if (isEmployeeRoute(pathname)) {
    if (user.role === 'EMPLOYEE') {
      console.log('Middleware - employee accessing employee route');
      return NextResponse.next();
    } else {
      console.log('Middleware - non-employee accessing employee route, redirecting to admin');
      // Redirect admins to their dashboard instead of homepage
      const adminUrl = new URL('/admin', req.url);
      return NextResponse.redirect(adminUrl);
    }
  }

  // If user is authenticated and onboarding is completed, redirect to appropriate dashboard
  if (user.onboardingCompleted && pathname === '/') {
    console.log('Middleware - authenticated user on root, redirecting to dashboard');
    if (user.role === 'ADMIN') {
      const adminUrl = new URL('/admin', req.url);
      return NextResponse.redirect(adminUrl);
    } else {
      const employeeUrl = new URL('/employee', req.url);
      return NextResponse.redirect(employeeUrl);
    }
  }

  console.log('Middleware - allowing request to continue');
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
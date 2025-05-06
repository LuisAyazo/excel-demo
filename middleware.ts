import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the URL is the old forms page
  if (request.nextUrl.pathname === '/dashboard/forms') {
    // Redirect to the new forms page
    return NextResponse.redirect(new URL('/dashboard/fichas/forms', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/dashboard/forms'],
};

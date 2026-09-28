import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// `nm_seller` is a presence hint set by the client after OTP login. The real check is the
// backend JWT (in localStorage) — pages clear the cookie and bounce to /login on a 401.
export function middleware(request: NextRequest) {
  const signedIn = request.cookies.get('nm_seller')?.value === '1'
  const { pathname } = request.nextUrl

  if ((pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding')) && !signedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (pathname === '/login' && signedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/login'],
}

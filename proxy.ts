import { NextResponse, type NextRequest } from 'next/server'

// Optimistic session check: Neon Auth sets a cookie named like
// `neon-auth.session_token` (or `__Secure-neon-auth.*` over HTTPS). We only
// check for its presence here — full validation happens in layouts/routes via
// `auth.getSession()`. Keeping the proxy network-free is the recommended pattern.
function hasSession(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some((c) => c.name.includes('neon-auth') && c.name.includes('session'))
}

export function proxy(request: NextRequest) {
  const loggedIn = hasSession(request)
  const pathname = request.nextUrl.pathname

  const isAuthPage   = pathname.startsWith('/login') || pathname.startsWith('/register')
  const isPublic     = pathname === '/' || pathname.startsWith('/join') ||
                       (pathname.startsWith('/api/applications') && request.method === 'POST')
  const isStaffRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/groups') ||
                       pathname.startsWith('/members') || pathname.startsWith('/contributions') ||
                       pathname.startsWith('/loans') || pathname.startsWith('/applications') ||
                       pathname.startsWith('/staff') || pathname.startsWith('/reports')
  const isMemberRoute = pathname.startsWith('/member')

  // Protect staff and member routes
  if (!loggedIn && (isStaffRoute || isMemberRoute) && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect logged-in user away from auth pages
  if (loggedIn && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

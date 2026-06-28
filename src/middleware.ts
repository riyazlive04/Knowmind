import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for public routes
  if (pathname === '/' || pathname === '/landing' || pathname === '/assessment') {
    return NextResponse.next()
  }

  // For /console/login, allow access (no auth required)
  if (pathname === '/console/login') {
    return NextResponse.next()
  }

  // For /console/*, require auth
  if (pathname.startsWith('/console')) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // No session: redirect to login
    if (!session) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/console/login'
      return NextResponse.redirect(redirectUrl)
    }

    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

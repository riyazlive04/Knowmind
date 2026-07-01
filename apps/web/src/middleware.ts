import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

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
    let res = NextResponse.next()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              res.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // No user: redirect to login
    if (!user) {
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

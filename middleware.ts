import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cs) => {
          cs.forEach(({ name, value }) => req.cookies.set(name, value))
          res = NextResponse.next({ request: req })
          cs.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = req.nextUrl

  const protectedPaths = ['/dashboard', '/builder']
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))
  const isAuthPage = pathname.startsWith('/auth/')

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }
  if (isAuthPage && user && !pathname.includes('callback')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/builder/:path*', '/auth/login', '/auth/signup'],
}

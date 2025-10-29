import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME, verifySessionToken, signSessionToken, buildCookieOptions, canAccessAdmin, ROTATE_THRESHOLD_SECONDS } from '@/lib/auth'

function isProtectedPath(pathname: string): { type: 'page' | 'api' | null } {
  if (pathname.startsWith('/api/admin')) return { type: 'api' }
  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) return { type: 'page' }
  return { type: null }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  // Remove temporary maintenance bypass; require auth for all admin APIs.
  const target = isProtectedPath(pathname)
  if (!target.type) {
    return NextResponse.next()
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!token) {
    if (target.type === 'api') {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    const url = new URL('/auth/signin', req.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  const session = await verifySessionToken(token)
  if (!session) {
    // Clear invalid cookie and redirect/deny
    const res = target.type === 'api' ? new NextResponse('Unauthorized', { status: 401 }) : NextResponse.redirect(new URL('/auth/signin', req.url))
    res.cookies.set(SESSION_COOKIE_NAME, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 })
    return res
  }

  // Role-based guard
  if (!canAccessAdmin(session.role)) {
    if (target.type === 'api') {
      return new NextResponse('Forbidden', { status: 403 })
    }
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  // Token rotation when nearing expiry
  const exp = session.exp // seconds since epoch
  if (typeof exp === 'number') {
    const nowSec = Math.floor(Date.now() / 1000)
    const remaining = exp - nowSec
    if (remaining > 0 && remaining < ROTATE_THRESHOLD_SECONDS) {
      const rotated = await signSessionToken({ sub: session.sub!, email: session.email as string, role: session.role })
      const cookie = buildCookieOptions(rotated)
      const res = NextResponse.next()
      res.cookies.set(cookie.name, cookie.value, cookie.options)
      return res
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/api/admin/:path*',
  ],
}

import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME, verifySessionToken, canAccessAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.json({ ok: false, authenticated: false }, { status: 401 })
  }

  const session = await verifySessionToken(token)
  if (!session) {
    return NextResponse.json({ ok: false, authenticated: false }, { status: 401 })
  }

  const role = String(session.role)
  const email = String(session.email || '')
  const sub = String(session.sub || '')
  const isAdmin = canAccessAdmin(role as any)
  return NextResponse.json({ ok: true, authenticated: true, user: { sub, email, role, isAdmin } })
}


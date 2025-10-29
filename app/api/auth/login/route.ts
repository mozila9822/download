import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { buildCookieOptions, signSessionToken, canAccessAdmin } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const email: string | undefined = body.email
    const password: string | undefined = body.password

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'Email and password are required.' }, { status: 400 })
    }

    const masterEmail = process.env.MASTER_ADMIN_EMAIL || ''
    const masterPassword = process.env.MASTER_ADMIN_PASSWORD || ''

    // Check master admin credentials first (server-side only)
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedMasterEmail = masterEmail.trim().toLowerCase()
    if (normalizedMasterEmail && masterPassword && normalizedEmail === normalizedMasterEmail && password === masterPassword) {
      const token = await signSessionToken({ sub: 'master_admin', email, role: 'master_admin' })
      const cookie = buildCookieOptions(token)
      const redirectTo = '/admin/workers'
      const res = NextResponse.json({ ok: true, role: 'master_admin', redirectTo })
      res.cookies.set(cookie.name, cookie.value, cookie.options)
      return res
    }

    // Fall back to normal DB auth with hashed passwords
    const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0
    if (!isDbConfigured || !prisma) {
      // In dev without DB, deny to avoid insecure auth bypass.
      return NextResponse.json({ ok: false, error: 'Database not configured.' }, { status: 500 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) {
      return NextResponse.json({ ok: false, error: 'Invalid credentials.' }, { status: 401 })
    }

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) {
      return NextResponse.json({ ok: false, error: 'Invalid credentials.' }, { status: 401 })
    }

    const role = String(user.role) as 'User' | 'Admin' | 'Staff' | 'SuperAdmin'
    const token = await signSessionToken({ sub: String(user.id), email: user.email, role })
    const cookie = buildCookieOptions(token)
    const redirectTo = canAccessAdmin(role) ? '/admin/workers' : '/profile'
    const res = NextResponse.json({ ok: true, role, redirectTo })
    res.cookies.set(cookie.name, cookie.value, cookie.options)
    return res
  } catch (e: any) {
    // Do not log passwords; return generic errors
    const message = e?.message || 'Internal Server Error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

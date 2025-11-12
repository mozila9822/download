import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prismaOrNull } from '@/lib/db'
import { buildCookieOptions, signSessionToken, canAccessAdmin } from '@/lib/auth'
import mysql from 'mysql2/promise'

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
    const db = await prismaOrNull()
    if (!db) {
      // Attempt direct MySQL fallback when Prisma engine is unavailable
      const host = process.env.MYSQL_HOST
      const userEnv = process.env.MYSQL_USER
      const passwordEnv = process.env.MYSQL_PASSWORD
      const database = process.env.MYSQL_DATABASE
      const port = Number(process.env.MYSQL_PORT || 3306)
      if (!host || !userEnv || !passwordEnv || !database) {
        return NextResponse.json({ ok: false, error: 'Database not configured or unreachable.' }, { status: 500 })
      }
      let conn: mysql.Connection | null = null
      try {
        conn = await mysql.createConnection({ host, user: userEnv, password: passwordEnv, database, port })
        const normalizedEmail = email.trim().toLowerCase()
        const [rows] = await conn.query<any[]>(
          'SELECT id, email, role, passwordHash FROM `User` WHERE email = ? LIMIT 1',
          [normalizedEmail]
        )
        const row = Array.isArray(rows) && rows.length ? rows[0] : null
        if (!row || !row.passwordHash) {
          return NextResponse.json({ ok: false, error: 'Invalid credentials.' }, { status: 401 })
        }
        const match = await bcrypt.compare(password, row.passwordHash)
        if (!match) {
          return NextResponse.json({ ok: false, error: 'Invalid credentials.' }, { status: 401 })
        }
        const role = String(row.role) as 'User' | 'Admin' | 'Staff' | 'SuperAdmin'
        const token = await signSessionToken({ sub: String(row.id), email: String(row.email), role })
        const cookie = buildCookieOptions(token)
        const redirectTo = canAccessAdmin(role) ? '/admin/workers' : '/profile'
        const res = NextResponse.json({ ok: true, role, redirectTo })
        res.cookies.set(cookie.name, cookie.value, cookie.options)
        return res
      } catch (e: any) {
        const message = e?.message || 'Database not configured or unreachable.'
        return NextResponse.json({ ok: false, error: message }, { status: 500 })
      } finally {
        if (conn) await conn.end().catch(() => {})
      }
    }

    const user = await db.user.findUnique({ where: { email } })
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

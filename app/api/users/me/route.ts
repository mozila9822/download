import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth'

type MeResponse = {
  id?: number
  firstName?: string
  lastName?: string
  email: string
  phone?: string | null
  address?: string | null
  role: 'User' | 'Admin' | 'Staff' | 'SuperAdmin' | 'master_admin'
  editable: boolean
}

function splitName(name?: string | null): { firstName?: string; lastName?: string } {
  const n = (name || '').trim()
  if (!n) return {}
  const parts = n.split(/\s+/)
  const firstName = parts[0]
  const lastName = parts.slice(1).join(' ')
  return { firstName, lastName }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const session = await verifySessionToken(token)
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  // Master admin: no DB record, return limited, non-editable profile
  if (session.role === 'master_admin') {
    const resp: MeResponse = {
      email: session.email,
      role: 'master_admin',
      editable: false,
    }
    return NextResponse.json(resp)
  }

  const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0
  if (!isDbConfigured || !prisma) {
    return NextResponse.json({ ok: false, error: 'Database not configured.' }, { status: 500 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.email } })
  if (!user) {
    return NextResponse.json({ ok: false, error: 'User not found.' }, { status: 404 })
  }

  const { firstName, lastName } = splitName(user.name)
  const resp: MeResponse = {
    id: Number(user.id as any),
    firstName,
    lastName,
    email: user.email,
    phone: user.phone ?? null,
    address: user.address ?? null,
    role: user.role as any,
    editable: true,
  }
  return NextResponse.json(resp)
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const session = await verifySessionToken(token)
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  if (session.role === 'master_admin') {
    return NextResponse.json({ ok: false, error: 'Master admin profile cannot be edited.' }, { status: 403 })
  }

  const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0
  if (!isDbConfigured || !prisma) {
    return NextResponse.json({ ok: false, error: 'Database not configured.' }, { status: 500 })
  }

  const body = await req.json().catch(() => ({}))
  const firstName: string | undefined = (body.firstName || '').trim() || undefined
  const lastName: string | undefined = (body.lastName || '').trim() || undefined
  const phone: string | undefined = (body.phone || '').trim() || undefined
  const address: string | undefined = (body.address || '').trim() || undefined

  const name = [firstName, lastName].filter(Boolean).join(' ').trim() || undefined

  const updated = await prisma.user.update({
    where: { email: session.email },
    data: {
      name,
      phone,
      address,
    },
  })

  const { firstName: fn, lastName: ln } = splitName(updated.name)
  const resp: MeResponse = {
    id: Number(updated.id as any),
    firstName: fn,
    lastName: ln,
    email: updated.email,
    phone: updated.phone ?? null,
    address: updated.address ?? null,
    role: updated.role as any,
    editable: true,
  }
  return NextResponse.json(resp)
}


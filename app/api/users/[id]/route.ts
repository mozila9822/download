import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

type Role = 'Admin' | 'Staff' | 'User' | 'SuperAdmin'
type Status = 'Active' | 'Inactive'

function splitName(name?: string): { firstName: string; lastName: string } {
  if (!name || !name.trim()) return { firstName: '', lastName: '' }
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

function joinName(first?: string, last?: string): string | undefined {
  const fn = (first || '').trim()
  const ln = (last || '').trim()
  const name = [fn, ln].filter(Boolean).join(' ').trim()
  return name || undefined
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params
    if (!idParam) return new NextResponse('Missing id', { status: 400 })

    const body = await req.json().catch(() => ({}))
    const firstName: string | undefined = (body.firstName || '').trim() || undefined
    const lastName: string | undefined = (body.lastName || '').trim() || undefined
    const role: Role | undefined = body.role
    const status: Status | undefined = body.status
    const company: string | undefined = (body.company || '').trim() || undefined

    const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0
    if (!isDbConfigured || !prisma) {
      // Fallback mode: echo updated fields for UI consistency
      return NextResponse.json({
        id: idParam,
        firstName: firstName ?? '—',
        lastName: lastName ?? '',
        role: role ?? 'User',
        status: status ?? 'Active',
        company,
      })
    }

    const idNum = Number(idParam)
    if (!Number.isFinite(idNum)) {
      return new NextResponse('Invalid id', { status: 400 })
    }

    const name = joinName(firstName, lastName)
    console.log('[PATCH /api/users/:id] applying update', { id: idNum, name, role })
    const updated = await prisma.user.update({
      where: { id: idNum },
      data: {
        ...(name ? { name } : {}),
        ...(role ? { role } : {}),
        // status/company are not part of the Prisma User schema; ignore for DB updates
      },
    })

    const { firstName: fn, lastName: ln } = splitName(updated.name ?? undefined)
    return NextResponse.json({
      id: Number(updated.id as any),
      firstName: fn,
      lastName: ln,
      email: updated.email,
      role: String(updated.role) as Role,
      status: 'Active',
      addedDate: updated.createdAt.toISOString().split('T')[0],
      company,
    })
  } catch (e) {
    console.error('[PATCH /api/users/:id] error', e)
    return new Response('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params
    if (!idParam) return new NextResponse('Missing id', { status: 400 })

    const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0
    if (!isDbConfigured || !prisma) {
      // Fallback: pretend deletion succeeded
      return new NextResponse(null, { status: 204 })
    }

    const idNum = Number(idParam)
    if (!Number.isFinite(idNum)) {
      return new NextResponse('Invalid id', { status: 400 })
    }

    await prisma.user.delete({ where: { id: idNum } })
    return new NextResponse(null, { status: 204 })
  } catch (e) {
    console.error('[DELETE /api/users/:id] error', e)
    return new Response('Internal Server Error', { status: 500 })
  }
}

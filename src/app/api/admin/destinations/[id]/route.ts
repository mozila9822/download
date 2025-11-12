import { NextRequest, NextResponse } from 'next/server'
import { prismaOrNull } from '@/lib/db'
import { SESSION_COOKIE_NAME, verifySessionToken, canAccessAdmin } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await prismaOrNull()
    if (!client) return NextResponse.json({ ok: false, error: 'Database unreachable' }, { status: 503 })
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null
    if (!session || !canAccessAdmin(String(session.role) as any)) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    const body = await req.json().catch(() => ({}))
    const data: any = {}
    if (body.slug !== undefined) data.slug = String(body.slug).toLowerCase()
    if (body.name !== undefined) data.name = String(body.name)
    if (body.description !== undefined) data.description = body.description ?? null
    if (body.gallery !== undefined) data.gallery = body.gallery ?? null
    if (body.attractions !== undefined) data.attractions = body.attractions ?? null
    if (body.featuredHotelIds !== undefined) data.featuredHotelIds = body.featuredHotelIds ?? null
    const updated = await client.destination.update({ where: { id: params.id }, data })
    return NextResponse.json({ ok: true, destination: updated })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await prismaOrNull()
    if (!client) return NextResponse.json({ ok: false, error: 'Database unreachable' }, { status: 503 })
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null
    if (!session || !canAccessAdmin(String(session.role) as any)) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    await client.destination.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

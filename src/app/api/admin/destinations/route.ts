import { NextRequest, NextResponse } from 'next/server'
import { prismaOrNull } from '@/lib/db'
import { SESSION_COOKIE_NAME, verifySessionToken, canAccessAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const client = await prismaOrNull()
    if (!client) return NextResponse.json({ ok: false, error: 'Database unreachable' }, { status: 503 })
    const destModel = (client as any).destination
    if (!destModel || !destModel.findMany) return NextResponse.json({ ok: true, destinations: [] })
    const rows = await destModel.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json({ ok: true, destinations: rows })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const client = await prismaOrNull()
    if (!client) return NextResponse.json({ ok: false, error: 'Database unreachable' }, { status: 503 })
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null
    if (!session || !canAccessAdmin(String(session.role) as any)) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    const body = await req.json().catch(() => ({}))
    const payload: any = {
      slug: String(body.slug || '').toLowerCase(),
      name: String(body.name || ''),
      description: body.description ?? null,
      gallery: body.gallery ?? null,
      attractions: body.attractions ?? null,
      featuredHotelIds: body.featuredHotelIds ?? null,
    }
    if (!payload.slug || !payload.name) return NextResponse.json({ ok: false, error: 'Missing slug or name' }, { status: 400 })
    const created = await client.destination.create({ data: payload })
    return NextResponse.json({ ok: true, destination: created }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

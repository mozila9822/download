import { NextRequest, NextResponse } from 'next/server'
import { prismaOrNull } from '@/lib/db'
import { SESSION_COOKIE_NAME, verifySessionToken, canAccessAdmin } from '@/lib/auth'

function parseMonth(v?: string) {
  const d = v ? new Date(`${v}-01T00:00:00`) : new Date()
  if (Number.isNaN(d.getTime())) return new Date()
  return d
}

function monthRange(base: Date) {
  const start = new Date(base.getFullYear(), base.getMonth(), 1)
  const end = new Date(base.getFullYear(), base.getMonth() + 1, 0)
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null
    const isAdmin = session ? canAccessAdmin(String(session.role) as any) : false
    if (!isAdmin) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

    const client = await prismaOrNull()
    if (!client) return NextResponse.json({ ok: false, error: 'Database unreachable' }, { status: 503 })

    const url = new URL(req.url)
    const m = parseMonth(url.searchParams.get('month') || undefined)
    const { start, end } = monthRange(m)
    const availModel = (client as any).availability
    const rows = availModel && availModel.findMany
      ? await availModel.findMany({ where: { serviceId: params.id, date: { gte: start, lte: end } }, orderBy: { date: 'asc' } })
      : []
    const days: any[] = []
    const totalDays = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate()
    for (let d = 1; d <= totalDays; d++) {
      const dt = new Date(m.getFullYear(), m.getMonth(), d)
      dt.setHours(0, 0, 0, 0)
      const row = rows.find(r => new Date(r.date).toDateString() === dt.toDateString())
      days.push({
        date: `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        blocked: row?.blocked ?? false,
        capacity: row?.capacity ?? 1,
        booked: row?.booked ?? 0,
        priceOverride: row?.priceOverride ?? null,
      })
    }
    return NextResponse.json({ ok: true, month: `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`, days })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null
    const isAdmin = session ? canAccessAdmin(String(session.role) as any) : false
    if (!isAdmin) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

    const client = await prismaOrNull()
    if (!client) return NextResponse.json({ ok: false, error: 'Database unreachable' }, { status: 503 })

    const body = await req.json().catch(() => ({}))
    const items: Array<{ date: string; blocked?: boolean; capacity?: number; priceOverride?: number | null }> = Array.isArray(body?.items) ? body.items : []
    if (items.length === 0) return NextResponse.json({ ok: false, error: 'No items' }, { status: 400 })

    for (const it of items) {
      const d = new Date(`${it.date}T00:00:00`)
      if (Number.isNaN(d.getTime())) continue
      const existing = await client.availability.findUnique({ where: { Availability_service_date_unique: { serviceId: params.id, date: d } } })
      const data: any = {}
      if (typeof it.blocked === 'boolean') data.blocked = it.blocked
      if (typeof it.capacity === 'number') data.capacity = it.capacity
      if (it.priceOverride === null) data.priceOverride = null
      else if (typeof it.priceOverride === 'number') data.priceOverride = it.priceOverride
      if (existing) {
        await client.availability.update({ where: { id: existing.id }, data })
      } else {
        await client.availability.create({ data: { serviceId: params.id, date: d, capacity: data.capacity ?? 1, blocked: data.blocked ?? false, priceOverride: data.priceOverride ?? null } })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Internal Server Error' }, { status: 500 })
  }
}

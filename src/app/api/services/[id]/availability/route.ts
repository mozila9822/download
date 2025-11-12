import { NextRequest, NextResponse } from 'next/server'
import { prismaOrNull } from '@/lib/db'

function parseDate(dateStr?: string): Date | null {
  if (!dateStr) return null
  const d = new Date(`${dateStr}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function endOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

function hourlySlotsForDate(date: Date, startHour = 9, endHour = 17) {
  const slots: { start: string; end: string }[] = []
  for (let h = startHour; h <= endHour; h++) {
    const start = new Date(date)
    start.setHours(h, 0, 0, 0)
    const end = new Date(start)
    end.setHours(h + 1, 0, 0, 0)
    slots.push({ start: start.toISOString(), end: end.toISOString() })
  }
  return slots
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const serviceId = params.id
    const url = new URL(req.url)
    const dateStr = url.searchParams.get('date') || undefined
    const date = parseDate(dateStr) || new Date()

    const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0
    const client = await prismaOrNull()
    if (!isDbConfigured || !client) {
      const slots = hourlySlotsForDate(date).map((s) => ({ ...s, available: true }))
      return NextResponse.json({ ok: true, serviceId, date: date.toISOString().split('T')[0], slots })
    }

    const service = await client.service.findUnique({ where: { id: serviceId } })
    if (!service) return NextResponse.json({ ok: false, error: 'Service not found' }, { status: 404 })

    // If the service has start/end date constraints, ensure date is within range
    if (service.startDate && date < new Date(service.startDate)) {
      return NextResponse.json({ ok: true, serviceId, date: date.toISOString().split('T')[0], slots: [] })
    }
    if (service.endDate && date > new Date(service.endDate)) {
      return NextResponse.json({ ok: true, serviceId, date: date.toISOString().split('T')[0], slots: [] })
    }

    const dayStart = startOfDay(date)
    const dayEnd = endOfDay(date)
    const existing = await client.booking.findMany({
      where: { serviceId, travelDate: { gte: dayStart, lte: dayEnd } },
      orderBy: { travelDate: 'asc' },
    })

    const slots = hourlySlotsForDate(date)
    const occupiedKeys = new Set(
      existing.map((b) => {
        const d = new Date(b.travelDate)
        return `${d.getHours()}`
      })
    )
    const availability = slots.map((s) => {
      const h = new Date(s.start).getHours()
      const available = !occupiedKeys.has(`${h}`)
      return { ...s, available }
    })

    return NextResponse.json({ ok: true, serviceId, date: date.toISOString().split('T')[0], slots: availability })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Internal Server Error' }, { status: 500 })
  }
}

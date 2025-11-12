import { NextResponse } from 'next/server'
import { prismaOrNull } from '@/lib/db'

export async function POST() {
  try {
    const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0
    const client = await prismaOrNull()
    if (!isDbConfigured || !client) {
      return NextResponse.json({ ok: false, error: 'Database unreachable.' }, { status: 503 })
    }

    const deletedBookings = await client.booking.deleteMany({})
    const deletedServices = await client.service.deleteMany({})
    // We intentionally do not delete users; use a separate admin flow for that.

    return NextResponse.json({ ok: true, deleted: { bookings: deletedBookings.count, services: deletedServices.count } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

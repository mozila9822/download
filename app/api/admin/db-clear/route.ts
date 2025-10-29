import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0
    if (!isDbConfigured || !prisma) {
      return NextResponse.json({ ok: false, error: 'Database not configured.' }, { status: 500 })
    }

    const deletedBookings = await prisma.booking.deleteMany({})
    const deletedServices = await prisma.service.deleteMany({})
    // We intentionally do not delete users; use a separate admin flow for that.

    return NextResponse.json({ ok: true, deleted: { bookings: deletedBookings.count, services: deletedServices.count } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}


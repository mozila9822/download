import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0
    if (!isDbConfigured || !prisma) {
      return NextResponse.json({ ok: false, error: 'Database not configured.' }, { status: 500 })
    }

    // Delete bookings first to avoid foreign key issues, then users
    const deletedBookings = await prisma.booking.deleteMany({})
    const deletedUsers = await prisma.user.deleteMany({})

    return NextResponse.json({ ok: true, deleted: { bookings: deletedBookings.count, users: deletedUsers.count } })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { prismaOrNull } from '@/lib/db'
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth'

type MyBookingRow = {
  id: string
  serviceTitle: string
  travelDate: string
  paymentStatus: string
  totalPrice: number
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const session = await verifySessionToken(token)
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const db = await prismaOrNull()
    if (!db) {
      // In development without DB, do not leak fallback/global bookings.
      // Return an empty list for normal users to avoid confusion.
      return NextResponse.json([] satisfies MyBookingRow[])
    }

    const user = await db.user.findUnique({ where: { email: session.email } })
    if (!user) {
      // If the session exists but there is no DB user yet, return empty.
      return NextResponse.json([] satisfies MyBookingRow[])
    }

    const rows = await db.booking.findMany({
      where: { userId: Number(user.id as any) },
      orderBy: { createdAt: 'desc' },
      include: { service: true },
    })

    const dto: MyBookingRow[] = rows.map((b) => ({
      id: String(b.id),
      serviceTitle: b.service?.title ?? '—',
      travelDate: b.travelDate.toISOString().split('T')[0],
      paymentStatus: String(b.paymentStatus || 'Pending'),
      totalPrice: Number(b.totalPrice || 0),
    }))

    return NextResponse.json(dto)
  } catch (e) {
    console.error('[GET /api/bookings/me] error', e)
    return new Response('Internal Server Error', { status: 500 })
  }
}

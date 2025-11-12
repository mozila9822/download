import { NextRequest, NextResponse } from 'next/server'
import { prismaOrNull } from '@/lib/db'
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth'

type BookPayload = {
  flight: {
    originCode: string
    destinationCode: string
    airline: string
    flightNumber: string
    departTime: string // ISO
    arriveTime: string // ISO
    cabin: 'economy' | 'premium' | 'business' | 'first'
    price: number
    currency: string
  }
  travelers: number
  contactName: string
  contactEmail: string
  contactPhone?: string
  notes?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: BookPayload = await req.json().catch(() => ({} as any))
    const f = body?.flight
    if (!f || !f.originCode || !f.destinationCode || !f.departTime || !f.airline || !body?.contactEmail || !body?.contactName) {
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 })
    }

    const travelers = Number(body.travelers || 1)
    if (!Number.isFinite(travelers) || travelers <= 0) {
      return NextResponse.json({ ok: false, error: 'Invalid travelers' }, { status: 400 })
    }

    const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0
    const client = await prismaOrNull()
    if (!isDbConfigured || !client) {
      // Dev fallback: no DB, just echo success (no persistence)
      return NextResponse.json({ ok: true, info: 'Booking created (dev fallback, no DB)', provider: 'mock', status: 'Succeeded' })
    }

    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null
    if (!session || !session.sub || session.role === 'master_admin') {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
    const userIdNum = Number(session.sub)
    if (!Number.isFinite(userIdNum)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Create or reuse a Service record to attach booking
    const title = `${f.airline} ${f.flightNumber}: ${f.originCode} → ${f.destinationCode}`
    const location = `${f.originCode} to ${f.destinationCode}`
    const desc = `Cabin: ${f.cabin}. Depart: ${new Date(f.departTime).toLocaleString()}. Arrive: ${new Date(f.arriveTime).toLocaleString()}.`

    const service = await client.service.create({
      data: {
        category: 'Flight',
        title,
        description: desc,
        price: f.price,
        location,
        imageUrl: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200&auto=format&fit=crop',
        status: 'Active',
        available: true,
        startDate: new Date(f.departTime),
        endDate: new Date(f.arriveTime),
        isOffer: false,
      },
    })

    const totalPrice = Math.round(Number(f.price) * travelers)
    const booking = await client.booking.create({
      data: {
        userId: userIdNum,
        serviceId: service.id,
        bookingDate: new Date(),
        travelDate: new Date(f.departTime),
        numberOfTravelers: travelers,
        totalPrice,
        paymentStatus: 'Pending',
        status: 'PendingPayment',
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone ?? null,
        contactName: body.contactName,
        notes: body.notes ?? null,
        travelers: null,
        currency: (f.currency || 'gbp').toLowerCase(),
      },
    })

    // Always require checkout step to finalize payment
    const stripeSecret = process.env.STRIPE_SECRET_KEY?.trim()
    const provider = stripeSecret ? 'stripe' : 'mock'
    return NextResponse.json({ ok: true, bookingId: booking.id, provider, next: '/api/payments/checkout' })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Internal Server Error' }, { status: 500 })
  }
}

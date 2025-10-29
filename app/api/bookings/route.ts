import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { recentBookings as seedBookings, services as fallbackServices } from '@/lib/data'
import type { Booking } from '@/lib/types'
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth'

// In-memory fallback store when DB is not configured
let memoryBookings: Booking[] = [...seedBookings]

export async function GET(_req: NextRequest) {
  try {
    const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0

    if (!isDbConfigured || !prisma) {
      const dto = memoryBookings.map((b) => ({
        id: b.id,
        customerName: 'Anonymous',
        serviceTitle: fallbackServices.find((s) => s.id === b.serviceId)?.title ?? b.serviceType,
        status: 'Pending',
        bookingDate: b.bookingDate,
        totalPrice: b.totalPrice,
      }))
      return Response.json(dto)
    }

    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true, service: true },
    })

    const dto = bookings.map((b) => ({
      id: b.id,
      customerName: b.user?.name ?? b.user?.email ?? 'Unknown',
      serviceTitle: b.service?.title ?? '—',
      status: b.status,
      bookingDate: b.bookingDate.toISOString().split('T')[0],
      totalPrice: b.totalPrice,
    }))

    return Response.json(dto)
  } catch (e) {
    console.error('[GET /api/bookings] error', e)
    return new Response('Internal Server Error', { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0
    const body = await req.json().catch(() => ({}))
    const serviceId: string | undefined = body.serviceId
    const travelDateStr: string | undefined = body.travelDate
    const numberOfTravelersRaw = body.numberOfTravelers
    const paymentStatus: string = body.paymentStatus ?? 'pending'

    if (!serviceId || !travelDateStr || numberOfTravelersRaw === undefined) {
      return Response.json({ ok: false, error: 'Missing required fields.' }, { status: 400 })
    }

    const numberOfTravelers = Number.parseInt(String(numberOfTravelersRaw), 10)
    if (!Number.isFinite(numberOfTravelers) || numberOfTravelers <= 0) {
      return Response.json({ ok: false, error: 'Invalid number of travelers.' }, { status: 400 })
    }

    // If DB available, require authenticated user and persist to DB
    if (isDbConfigured && prisma) {
      const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value
      const session = sessionCookie ? await verifySessionToken(sessionCookie) : null
      if (!session || !session.sub || session.role === 'master_admin') {
        return Response.json({ ok: false, error: 'Unauthorized.' }, { status: 401 })
      }

      const userIdNum = Number.parseInt(String(session.sub), 10)
      if (!Number.isFinite(userIdNum)) {
        return Response.json({ ok: false, error: 'Unauthorized.' }, { status: 401 })
      }

      const svc = await prisma.service.findUnique({ where: { id: serviceId } })
      if (!svc) {
        return Response.json({ ok: false, error: 'Service not found.' }, { status: 404 })
      }

      const basePrice = Number.isFinite(svc.offerPrice ?? NaN) && svc.offerPrice ? svc.offerPrice : svc.price
      const totalPrice = basePrice * numberOfTravelers
      const now = new Date()
      const travelDate = new Date(travelDateStr)
      if (Number.isNaN(travelDate.getTime())) {
        return Response.json({ ok: false, error: 'Invalid travel date.' }, { status: 400 })
      }

      const created = await prisma.booking.create({
        data: {
          userId: userIdNum,
          serviceId,
          bookingDate: now,
          travelDate,
          numberOfTravelers,
          totalPrice,
          paymentStatus,
          status: 'Pending',
        },
      })

      return Response.json({ ok: true, id: created.id })
    }

    // Fallback: store in memory for dev without DB
    const svc = fallbackServices.find((s) => s.id === serviceId)
    if (!svc) {
      return Response.json({ ok: false, error: 'Service not found.' }, { status: 404 })
    }

    const basePrice = Number.isFinite(svc.offerPrice ?? NaN) && svc.offerPrice ? svc.offerPrice : svc.price
    const totalPrice = basePrice * numberOfTravelers
    const nowIso = new Date().toISOString().split('T')[0]
    const travelDateIso = new Date(travelDateStr).toISOString().split('T')[0]
    const newBooking: Booking = {
      id: String(Date.now()),
      userId: 'anonymous',
      serviceType: svc.category,
      serviceId,
      bookingDate: nowIso,
      travelDate: travelDateIso,
      numberOfTravelers,
      totalPrice,
      paymentStatus,
    }
    memoryBookings = [
      { ...newBooking },
      ...memoryBookings,
    ]
    return Response.json({ ok: true, id: newBooking.id })
  } catch (e) {
    console.error('[POST /api/bookings] error', e)
    return new Response('Internal Server Error', { status: 500 })
  }
}

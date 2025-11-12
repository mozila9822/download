import { NextRequest } from 'next/server'
import { prismaOrNull } from '@/lib/db'
import { recentBookings as seedBookings, services as fallbackServices } from '@/lib/data'
import type { Booking } from '@/lib/types'
import { SESSION_COOKIE_NAME, verifySessionToken, canAccessAdmin } from '@/lib/auth'

// In-memory fallback store when DB is not configured
let memoryBookings: Booking[] = [...seedBookings]
// Track status overrides for fallback mode (DB unavailable)
const memoryBookingStatusOverrides: Record<string, string> = {}

export async function GET(_req: NextRequest) {
  try {
    const db = await prismaOrNull()
    if (!db) {
      const dto = memoryBookings.map((b) => ({
        id: b.id,
        customerName: 'Anonymous',
        serviceTitle: fallbackServices.find((s) => s.id === b.serviceId)?.title ?? b.serviceType,
        status: memoryBookingStatusOverrides[b.id] ?? 'Pending',
        bookingDate: b.bookingDate,
        totalPrice: b.totalPrice,
        travelDate: b.travelDate,
        numberOfTravelers: b.numberOfTravelers,
        paymentStatus: b.paymentStatus,
      }))
      return Response.json(dto)
    }

    const bookings = await db.booking.findMany({
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
      travelDate: b.travelDate.toISOString().split('T')[0],
      numberOfTravelers: b.numberOfTravelers,
      paymentStatus: b.paymentStatus,
    }))

    return Response.json(dto)
  } catch (e) {
    console.error('[GET /api/bookings] error', e)
    return new Response('Internal Server Error', { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = await prismaOrNull()
    const body = await req.json().catch(() => ({}))
    const serviceId: string | undefined = body.serviceId
    const travelDateStr: string | undefined = body.travelDate
    const numberOfTravelersRaw = body.numberOfTravelers
    const paymentStatus: string = body.paymentStatus ?? 'Pending'
    const contactEmail: string | undefined = body.contactEmail
    const contactPhone: string | undefined = body.contactPhone
    const contactName: string | undefined = body.contactName
    const notes: string | undefined = body.notes
    const travelers: any = body.travelers
    const extras: any = body.extras
    const currency: string = (body.currency || 'gbp').toLowerCase()

    if (!serviceId || !travelDateStr || numberOfTravelersRaw === undefined || !contactEmail || !contactName) {
      return Response.json({ ok: false, error: 'Missing required fields.' }, { status: 400 })
    }

    const numberOfTravelers = Number.parseInt(String(numberOfTravelersRaw), 10)
    if (!Number.isFinite(numberOfTravelers) || numberOfTravelers <= 0) {
      return Response.json({ ok: false, error: 'Invalid number of travelers.' }, { status: 400 })
    }

    // If DB available, require authenticated user and persist to DB
    if (db) {
      const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value
      const session = sessionCookie ? await verifySessionToken(sessionCookie) : null
      if (!session || !session.sub || session.role === 'master_admin') {
        return Response.json({ ok: false, error: 'Unauthorized.' }, { status: 401 })
      }

      const userIdNum = Number.parseInt(String(session.sub), 10)
      if (!Number.isFinite(userIdNum)) {
        return Response.json({ ok: false, error: 'Unauthorized.' }, { status: 401 })
      }

      const svc = await db.service.findUnique({ where: { id: serviceId } })
      if (!svc) {
        return Response.json({ ok: false, error: 'Service not found.' }, { status: 404 })
      }

      let basePrice = Number.isFinite(svc.offerPrice ?? NaN) && svc.offerPrice ? svc.offerPrice : svc.price
      const now = new Date()
      const travelDate = new Date(travelDateStr)
      if (Number.isNaN(travelDate.getTime())) {
        return Response.json({ ok: false, error: 'Invalid travel date.' }, { status: 400 })
      }

      try {
        const rules = await db.pricingRule.findMany({
          where: {
            active: true,
            OR: [
              { serviceId: svc.id },
              { category: svc.category as any },
            ],
            AND: [
              { OR: [{ startDate: null }, { startDate: { lte: travelDate } }] },
              { OR: [{ endDate: null }, { endDate: { gte: travelDate } }] },
            ],
          },
          orderBy: [{ priority: 'desc' }],
        })
        for (const r of rules) {
          const isWeekend = travelDate.getDay() === 0 || travelDate.getDay() === 6
          if (r.weekendOnly && !isWeekend) continue
          if (r.fixedOverride != null) {
            basePrice = Number(r.fixedOverride)
            break
          }
          if (r.multiplier != null) {
            basePrice = Number(basePrice) * Number(r.multiplier)
            break
          }
        }
      } catch {}

      const totalPrice = basePrice * numberOfTravelers

      const created = await db.booking.create({
        data: {
          userId: userIdNum,
          serviceId,
          bookingDate: now,
          travelDate,
          numberOfTravelers,
          totalPrice,
          paymentStatus,
          status: 'PendingPayment',
          contactEmail,
          contactPhone: contactPhone ?? null,
          contactName,
          notes: notes ?? null,
          travelers: travelers ?? null,
          extras: extras ?? null,
          currency,
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
      extras: extras ?? undefined,
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

export async function PATCH(req: NextRequest) {
  try {
    const db = await prismaOrNull()
    const body = await req.json().catch(() => ({}))
    const id: string | undefined = body.id
    const status: string | undefined = body.status
    const paymentStatus: string | undefined = body.paymentStatus
    const travelDateStr: string | undefined = body.travelDate
    const numberOfTravelersRaw = body.numberOfTravelers
    const notes: string | undefined = body.notes
    const contactEmail: string | undefined = body.contactEmail
    const contactPhone: string | undefined = body.contactPhone
    const contactName: string | undefined = body.contactName
    const extras: any = body.extras
    const currency: string | undefined = body.currency

    if (!id) {
      return Response.json({ ok: false, error: 'Missing id.' }, { status: 400 })
    }

    // Require admin privileges for status updates
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const session = sessionCookie ? await verifySessionToken(sessionCookie) : null
    if (!session || !canAccessAdmin(session.role)) {
      return Response.json({ ok: false, error: 'Unauthorized.' }, { status: 401 })
    }

    if (db) {
      const data: Record<string, any> = {}
      if (typeof status === 'string') data.status = status
      if (typeof paymentStatus === 'string') data.paymentStatus = paymentStatus
      if (typeof notes === 'string') data.notes = notes
      if (typeof contactEmail === 'string') data.contactEmail = contactEmail
      if (typeof contactPhone === 'string') data.contactPhone = contactPhone
      if (typeof contactName === 'string') data.contactName = contactName
      if (typeof currency === 'string') data.currency = currency.toLowerCase()

      if (typeof travelDateStr === 'string') {
        const travelDate = new Date(travelDateStr)
        if (Number.isNaN(travelDate.getTime())) {
          return Response.json({ ok: false, error: 'Invalid travel date.' }, { status: 400 })
        }
        data.travelDate = travelDate
      }

      if (numberOfTravelersRaw !== undefined) {
        const num = Number.parseInt(String(numberOfTravelersRaw), 10)
        if (!Number.isFinite(num) || num <= 0) {
          return Response.json({ ok: false, error: 'Invalid number of travelers.' }, { status: 400 })
        }
        data.numberOfTravelers = num
        // Recalculate total price if possible
        const booking = await db.booking.findUnique({ where: { id }, include: { service: true } })
        if (!booking) {
          return Response.json({ ok: false, error: 'Booking not found.' }, { status: 404 })
        }
        const basePrice = Number.isFinite(booking.service?.offerPrice ?? NaN) && booking.service?.offerPrice
          ? booking.service!.offerPrice!
          : (booking.service?.price ?? 0)
        if (Number.isFinite(basePrice)) {
          data.totalPrice = basePrice * num
        }
      }

      if (extras !== undefined) {
        data.extras = extras
      }

      try {
        const svc = await db.booking.findUnique({ where: { id }, include: { service: true } })
        if (svc && numberOfTravelersRaw !== undefined) {
          let bp = Number.isFinite(svc.service?.offerPrice ?? NaN) && svc.service?.offerPrice ? svc.service!.offerPrice! : (svc.service?.price ?? 0)
          const td = typeof travelDateStr === 'string' ? new Date(travelDateStr) : svc.travelDate
          const rules = await db.pricingRule.findMany({
            where: {
              active: true,
              OR: [
                { serviceId: svc.serviceId },
                { category: svc.service?.category as any },
              ],
              AND: [
                { OR: [{ startDate: null }, { startDate: { lte: td } }] },
                { OR: [{ endDate: null }, { endDate: { gte: td } }] },
              ],
            },
            orderBy: [{ priority: 'desc' }],
          })
          for (const r of rules) {
            const isWeekend = td.getDay() === 0 || td.getDay() === 6
            if (r.weekendOnly && !isWeekend) continue
            if (r.fixedOverride != null) { bp = Number(r.fixedOverride); break }
            if (r.multiplier != null) { bp = Number(bp) * Number(r.multiplier); break }
          }
          data.totalPrice = bp * data.numberOfTravelers
        }
      } catch {}

      await db.booking.update({ where: { id }, data })
      return Response.json({ ok: true })
    }

    // Fallback: just track status change in memory
    const idx = memoryBookings.findIndex(b => b.id === id)
    if (idx === -1) {
      return Response.json({ ok: false, error: 'Booking not found.' }, { status: 404 })
    }
    const prev = memoryBookings[idx]
    const updated: Booking = { ...prev }
    if (typeof travelDateStr === 'string') {
      const d = new Date(travelDateStr)
      if (Number.isNaN(d.getTime())) {
        return Response.json({ ok: false, error: 'Invalid travel date.' }, { status: 400 })
      }
      updated.travelDate = d.toISOString().split('T')[0]
    }
    if (numberOfTravelersRaw !== undefined) {
      const num = Number.parseInt(String(numberOfTravelersRaw), 10)
      if (!Number.isFinite(num) || num <= 0) {
        return Response.json({ ok: false, error: 'Invalid number of travelers.' }, { status: 400 })
      }
      updated.numberOfTravelers = num
      const svc = fallbackServices.find(s => s.id === updated.serviceId)
      if (svc) {
        const basePrice = Number.isFinite(svc.offerPrice ?? NaN) && svc.offerPrice ? svc.offerPrice : svc.price
        updated.totalPrice = basePrice * num
      }
    }
    if (typeof paymentStatus === 'string') updated.paymentStatus = paymentStatus
    if (extras !== undefined) updated.extras = extras
    memoryBookings = [
      ...memoryBookings.slice(0, idx),
      updated,
      ...memoryBookings.slice(idx + 1),
    ]
    if (typeof status === 'string') memoryBookingStatusOverrides[id] = status
    return Response.json({ ok: true })
  } catch (e) {
    console.error('[PATCH /api/bookings] error', e)
    return new Response('Internal Server Error', { status: 500 })
  }
}

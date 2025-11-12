import { NextRequest, NextResponse } from 'next/server'
import { prismaOrNull } from '@/lib/db'
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const bookingId: string | undefined = body.bookingId
    if (!bookingId) return NextResponse.json({ ok: false, error: 'bookingId is required' }, { status: 400 })

    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

    const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0
    const client = await prismaOrNull()
    if (!isDbConfigured || !client) {
      return NextResponse.json({ ok: false, error: 'Database unreachable.' }, { status: 503 })
    }

    const booking = await client.booking.findUnique({
      where: { id: bookingId },
      include: { service: true, user: true },
    })
    if (!booking) return NextResponse.json({ ok: false, error: 'Booking not found' }, { status: 404 })

    if (Number(booking.userId) !== Number(session.sub)) {
      return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
    }

    const needsPayment = String(booking.status) === 'PendingPayment' || String(booking.paymentStatus).toLowerCase() === 'pending'
    if (!needsPayment) {
      return NextResponse.json({ ok: true, info: 'Booking already paid or not payable.' })
    }

    const amountCents = Math.round(Number(booking.totalPrice) * 100)
    const currency = (booking.currency || 'gbp').toLowerCase()

    const stripeSecret = process.env.STRIPE_SECRET_KEY?.trim()
    if (stripeSecret) {
      const stripe = new Stripe(stripeSecret)
      const successUrl = process.env.APP_URL?.trim() || 'http://localhost:9005/profile'
      const cancelUrl = successUrl

      const sessionCheckout = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency,
              product_data: { name: booking.service?.title || 'Travel Service' },
              unit_amount: amountCents,
            },
            quantity: 1,
          },
        ],
        customer_email: booking.contactEmail || session.email,
        success_url: successUrl,
        cancel_url: cancelUrl,
      })

      await client.payment.create({
        data: {
          bookingId: booking.id,
          userId: Number(booking.userId as any),
          provider: 'stripe',
          intentId: sessionCheckout.id,
          clientSecret: sessionCheckout.client_secret ?? null,
          status: 'RequiresPaymentMethod',
          amount: amountCents,
          currency,
        },
      })

      return NextResponse.json({ ok: true, provider: 'stripe', checkoutUrl: sessionCheckout.url })
    }

    // Mock provider fallback: instantly mark as paid
    await client.payment.create({
      data: {
        bookingId: booking.id,
        userId: Number(booking.userId as any),
        provider: 'mock',
        status: 'Succeeded',
        amount: amountCents,
        currency,
      },
    })

    await client.booking.update({
      where: { id: booking.id },
      data: { paymentStatus: 'Paid', status: 'Confirmed' },
    })

    return NextResponse.json({ ok: true, provider: 'mock', status: 'Succeeded' })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Internal Server Error' }, { status: 500 })
  }
}

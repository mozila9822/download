import { NextRequest, NextResponse } from 'next/server'
import { prismaOrNull } from '@/lib/db'
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const paymentId: string | undefined = body.paymentId
    if (!paymentId) return NextResponse.json({ ok: false, error: 'paymentId is required' }, { status: 400 })

    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

    const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0
    const client = await prismaOrNull()
    if (!isDbConfigured || !client) {
      return NextResponse.json({ ok: false, error: 'Database unreachable.' }, { status: 503 })
    }

    const payment = await client.payment.findUnique({ include: { booking: true }, where: { id: paymentId } })
    if (!payment) return NextResponse.json({ ok: false, error: 'Payment not found' }, { status: 404 })
    if (Number(payment.userId) !== Number(session.sub)) {
      return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
    }

    if (payment.provider !== 'mock') {
      return NextResponse.json({ ok: false, error: 'Capture not supported for this provider.' }, { status: 400 })
    }

    if (String(payment.status) === 'Succeeded') {
      // Idempotent: ensure booking is marked paid
      await client.booking.update({ where: { id: payment.bookingId }, data: { paymentStatus: 'Paid', status: 'Confirmed' } })
      return NextResponse.json({ ok: true, status: 'Succeeded' })
    }

    const updated = await client.payment.update({ where: { id: paymentId }, data: { status: 'Succeeded' } })
    await client.booking.update({ where: { id: updated.bookingId }, data: { paymentStatus: 'Paid', status: 'Confirmed' } })
    return NextResponse.json({ ok: true, status: 'Succeeded' })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Internal Server Error' }, { status: 500 })
  }
}

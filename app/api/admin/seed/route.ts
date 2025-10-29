import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

type SeedResult = {
  ok: boolean
  created: {
    users: number
    services: number
    bookings: number
  }
  details?: any
}

export async function POST(req: NextRequest) {
  try {
    const input = await req.json().catch(() => ({}))
    const userEmail: string = input.email ?? 'demo.user@hotelbeyond.local'
    const userName: string | undefined = input.name ?? 'Demo User'

    const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0
    if (!isDbConfigured || !prisma) {
      return NextResponse.json({ ok: false, error: 'Database not configured.' }, { status: 500 })
    }

    let usersCreated = 0
    let servicesCreated = 0
    let bookingsCreated = 0

    // 1) Ensure an admin/demo user exists
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: { name: userName },
      create: { email: userEmail, name: userName, role: 'Admin' as any },
    })
    usersCreated += 1

    // 2) Seed a few services only if none exist
    const existingServiceCount = await prisma.service.count()
    let seededServiceIds: string[] = []
    if (existingServiceCount === 0) {
      const samples = [
        {
          category: 'CityBreak' as any,
          title: 'Paris Getaway 3D2N',
          description: 'Explore Paris with guided tours, museum passes, and local cuisine.',
          price: 399,
          offerPrice: 299,
          location: 'Paris, France',
          imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
        },
        {
          category: 'CoachRide' as any,
          title: 'Highlands Scenic Coach Ride',
          description: 'A day trip through breathtaking landscapes and historic villages.',
          price: 89,
          offerPrice: null,
          location: 'Scottish Highlands',
          imageUrl: 'https://images.unsplash.com/photo-1476038279239-1f347a5e2f68',
        },
        {
          category: 'Hotel' as any,
          title: 'Beachside Resort (3 nights)',
          description: 'Relaxing stay with breakfast, pool access, and spa discounts.',
          price: 549,
          offerPrice: 449,
          location: 'Phuket, Thailand',
          imageUrl: 'https://images.unsplash.com/photo-1501117716987-c8e98a3a3c7f',
        },
      ]

      for (const s of samples) {
        const created = await prisma.service.create({ data: s })
        seededServiceIds.push(created.id)
        servicesCreated += 1
      }
    }

    // 3) Create a sample booking if none exist
    const existingBookingCount = await prisma.booking.count()
    if (existingBookingCount === 0) {
      const serviceId = seededServiceIds[0] || (await prisma.service.findFirst({ select: { id: true } }))?.id
      if (!serviceId) {
        return NextResponse.json({ ok: false, error: 'No service available to create a booking.' }, { status: 500 })
      }

      const numberOfTravelers = 2
      const svc = await prisma.service.findUnique({ where: { id: serviceId } })
      const totalPrice = ((svc?.offerPrice ?? svc?.price ?? 0) * numberOfTravelers)

      await prisma.booking.create({
        data: {
          userId: Number(user.id as any),
          serviceId,
          bookingDate: new Date(),
          travelDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          numberOfTravelers,
          totalPrice,
          paymentStatus: 'Paid',
          status: 'Confirmed',
        },
      })
      bookingsCreated += 1
    }

    const result: SeedResult = {
      ok: true,
      created: { users: usersCreated, services: servicesCreated, bookings: bookingsCreated },
    }

    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

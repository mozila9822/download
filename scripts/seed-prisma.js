/*
 * Seed MySQL/Prisma with baseline data so the app runs on DB.
 * Usage: node scripts/seed-prisma.js
 */

const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()

  const userEmail = process.env.SEED_USER_EMAIL || 'demo.user@hotelbeyond.local'
  const userName = process.env.SEED_USER_NAME || 'Demo User'

  // 1) Ensure an admin/demo user exists
  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: { name: userName },
    create: { email: userEmail, name: userName, role: 'Admin' },
  })

  // 2) Seed a few services if none exist
  const existingServiceCount = await prisma.service.count()
  let seededServiceIds = []
  if (existingServiceCount === 0) {
    const samples = [
      {
        category: 'CityBreak',
        title: 'Paris Getaway 3D2N',
        description: 'Explore Paris with guided tours, museum passes, and local cuisine.',
        price: 399,
        offerPrice: 299,
        location: 'Paris, France',
        imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
      },
      {
        category: 'CoachRide',
        title: 'Highlands Scenic Coach Ride',
        description: 'A day trip through breathtaking landscapes and historic villages.',
        price: 89,
        offerPrice: null,
        location: 'Scottish Highlands',
        imageUrl: 'https://images.unsplash.com/photo-1476038279239-1f347a5e2f68',
      },
      {
        category: 'Hotel',
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
    }
  } else {
    const first = await prisma.service.findFirst({ select: { id: true } })
    if (first?.id) seededServiceIds.push(first.id)
  }

  // 3) Create a sample booking if none exist
  const existingBookingCount = await prisma.booking.count()
  if (existingBookingCount === 0 && seededServiceIds.length > 0) {
    const serviceId = seededServiceIds[0]
    const numberOfTravelers = 2
    const svc = await prisma.service.findUnique({ where: { id: serviceId } })
    const totalPrice = ((svc?.offerPrice ?? svc?.price ?? 0) * numberOfTravelers)

    await prisma.booking.create({
      data: {
        userId: user.id,
        serviceId,
        bookingDate: new Date(),
        travelDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        numberOfTravelers,
        totalPrice,
        paymentStatus: 'Paid',
        status: 'Confirmed',
        contactEmail: user.email,
        contactName: user.name || 'Demo User',
      },
    })
  }

  // Summary
  const users = await prisma.user.count()
  const services = await prisma.service.count()
  const bookings = await prisma.booking.count()
  console.log('✅ Seed complete:', { users, services, bookings })
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exitCode = 1
  })
  .finally(() => {
    process.exit()
  })


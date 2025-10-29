import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { services as fallbackServices } from '@/lib/data'

function toDbCategory(category: string): 'CityBreak' | 'Tour' | 'Hotel' | 'Flight' | 'CoachRide' | undefined {
  switch (category) {
    case 'City Break':
      return 'CityBreak'
    case 'Coach Ride':
      return 'CoachRide'
    case 'Tour':
    case 'Hotel':
    case 'Flight':
      return category as any
    default:
      return undefined
  }
}

export async function POST(_req: NextRequest) {
  try {
    const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0
    if (!isDbConfigured || !prisma) {
      return NextResponse.json({ ok: false, error: 'Database not configured.' }, { status: 500 })
    }

    let created = 0
    let skipped = 0
    const errors: Array<{ title: string; error: string }> = []

    for (const s of fallbackServices) {
      try {
        const dbCategory = toDbCategory(String(s.category))
        if (!dbCategory) {
          skipped += 1
          continue
        }

        const exists = await prisma.service.findFirst({
          where: { title: s.title, category: dbCategory as any },
        })

        if (exists) {
          skipped += 1
          continue
        }

        await prisma.service.create({
          data: {
            category: dbCategory as any,
            title: s.title,
            description: s.description,
            price: Number(s.price),
            offerPrice: s.offerPrice != null ? Number(s.offerPrice) : null,
            location: s.location,
            imageUrl: s.imageUrl ?? '',
          },
        })
        created += 1
      } catch (e: any) {
        errors.push({ title: s.title, error: e?.message || String(e) })
      }
    }

    return NextResponse.json({ ok: true, created, skipped, errors })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}


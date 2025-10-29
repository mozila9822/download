import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { services as fallbackServices } from '@/lib/data'

function mapCategoryParam(category?: string) {
  if (!category || category === 'All') return undefined
  switch (category) {
    case 'City Break':
      return 'CityBreak'
    case 'Coach Ride':
      return 'CoachRide'
    case 'Tour':
    case 'Hotel':
    case 'Flight':
      return category
    default:
      return undefined
  }
}

function mapDbCategoryToUi(dbCat: string): string {
  switch (dbCat) {
    case 'CityBreak':
      return 'City Break'
    case 'CoachRide':
      return 'Coach Ride'
    default:
      return dbCat
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryParam = mapCategoryParam(searchParams.get('category') || undefined)
    const q = (searchParams.get('q') || '').trim()
    const limitRaw = (searchParams.get('limit') || '').trim()
    const take = limitRaw ? Math.max(1, Math.min(Number(limitRaw) || 0, 50)) : undefined
    const offerOnly = (searchParams.get('offerOnly') || '').toLowerCase() === 'true'

    const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0

    if (!isDbConfigured || !prisma) {
      let filtered = categoryParam
        ? fallbackServices.filter((s) => mapCategoryParam(s.category) === categoryParam)
        : fallbackServices

      if (q) {
        const ql = q.toLowerCase()
        filtered = filtered.filter(
          (s) =>
            s.title.toLowerCase().includes(ql) ||
            s.location.toLowerCase().includes(ql) ||
            s.description.toLowerCase().includes(ql)
        )
      }

      if (offerOnly) {
        filtered = filtered.filter((s) => !!s.offerPrice)
      }

      if (take) {
        filtered = filtered.slice(0, take)
      }

      return Response.json(filtered)
    }

    const rows = await prisma.service.findMany({
      where: {
        status: 'Active',
        available: true,
        ...(categoryParam ? { category: categoryParam as any } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q } },
                { location: { contains: q } },
                { description: { contains: q } },
              ],
            }
          : {}),
        ...(offerOnly ? { NOT: { offerPrice: null } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      ...(take ? { take } : {}),
    })

    const dto = rows.map((s) => ({
      id: s.id,
      category: mapDbCategoryToUi(String(s.category)),
      title: s.title,
      description: s.description,
      price: s.price,
      offerPrice: s.offerPrice ?? undefined,
      location: s.location,
      imageUrl: s.imageUrl,
    }))

    return Response.json(dto)
  } catch (e) {
    console.error('[GET /api/services] error', e)
    return new Response('Internal Server Error', { status: 500 })
  }
}

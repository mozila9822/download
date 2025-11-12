import { NextRequest } from 'next/server'
import { prismaOrNull } from '@/lib/db'
import { services as fallbackServices } from '@/lib/data'

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

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0

    if (!id) return Response.json({ ok: false, error: 'Missing id' }, { status: 400 })

    // Fallback to in-memory data if DB is not configured
    const client = await prismaOrNull()
    if (!isDbConfigured || !client) {
      const row = fallbackServices.find((s) => s.id === id)
      if (!row) return Response.json({ ok: false, error: 'Not found' }, { status: 404 })
      return Response.json({
        ok: true,
        service: {
          id: row.id,
          category: row.category,
          title: row.title,
          description: row.description,
          price: row.price,
          offerPrice: row.offerPrice ?? undefined,
          location: row.location,
          imageUrl: row.imageUrl,
        },
      })
    }

    const s = await client.service.findUnique({ where: { id } })
    if (!s || String(s.status) !== 'Active' || !s.available) {
      return Response.json({ ok: false, error: 'Not found' }, { status: 404 })
    }

    const dto = {
      id: s.id,
      category: mapDbCategoryToUi(String(s.category)),
      title: s.title,
      description: s.description,
      price: s.price,
      offerPrice: s.offerPrice ?? undefined,
      location: s.location,
      imageUrl: s.imageUrl,
    }

    return Response.json({ ok: true, service: dto })
  } catch (e) {
    console.error('[GET /api/services/:id] error', e)
    return Response.json({ ok: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

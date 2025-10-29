import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { SESSION_COOKIE_NAME, verifySessionToken, canAccessAdmin } from '@/lib/auth'

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

export async function POST(req: NextRequest) {
  try {
    const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0
    if (!isDbConfigured || !prisma) {
      return NextResponse.json({ ok: false, error: 'Database not configured.' }, { status: 500 })
    }

    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null
    const isAdmin = session ? canAccessAdmin(String(session.role) as any) : false
    if (!isAdmin) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const categoryUi: string | undefined = body.category
    const title: string | undefined = body.title
    const description: string | undefined = body.description
    const price: number | undefined = body.price
    const offerPrice: number | undefined = body.offerPrice
    const location: string | undefined = body.location
    const imageUrl: string | undefined = body.imageUrl
    const status: string | undefined = body.status
    const available: boolean | undefined = body.available
    const startDate: string | undefined = body.startDate
    const endDate: string | undefined = body.endDate
    const isOffer: boolean | undefined = body.isOffer

    const category = mapCategoryParam(categoryUi)
    if (!category) return NextResponse.json({ ok: false, error: 'Invalid or missing category.' }, { status: 400 })
    if (!title || !description || typeof price !== 'number' || !location || !imageUrl) {
      return NextResponse.json({ ok: false, error: 'Missing required fields.' }, { status: 400 })
    }

    const created = await prisma.service.create({
      data: {
        category: category as any,
        title,
        description,
        price,
        offerPrice: offerPrice != null ? offerPrice : null,
        location,
        imageUrl,
        status: (status === 'Active' || status === 'Inactive' || status === 'Archived') ? (status as any) : 'Active',
        available: available != null ? !!available : true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isOffer: !!isOffer || (!!offerPrice && Number(offerPrice) > 0),
      },
    })

    const dto = {
      id: created.id,
      category: mapDbCategoryToUi(String(created.category)),
      title: created.title,
      description: created.description,
      price: created.price,
      offerPrice: created.offerPrice ?? undefined,
      location: created.location,
      imageUrl: created.imageUrl,
      status: String(created.status),
      available: !!created.available,
      startDate: created.startDate ? created.startDate.toISOString() : undefined,
      endDate: created.endDate ? created.endDate.toISOString() : undefined,
      isOffer: !!created.isOffer,
    }
    return NextResponse.json({ ok: true, service: dto }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0
    if (!isDbConfigured || !prisma) {
      return NextResponse.json({ ok: false, error: 'Database not configured.' }, { status: 500 })
    }

    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null
    const isAdmin = session ? canAccessAdmin(String(session.role) as any) : false
    if (!isAdmin) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const categoryParam = mapCategoryParam(searchParams.get('category') || undefined)
    const q = (searchParams.get('q') || '').trim()
    const status = (searchParams.get('status') || '').trim()
    const availableParam = (searchParams.get('available') || '').trim()
    const offerOnly = (searchParams.get('offerOnly') || '').toLowerCase() === 'true'

    const rows = await prisma.service.findMany({
      where: {
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
        ...(status && ['Active', 'Inactive', 'Archived'].includes(status)
          ? { status: status as any }
          : {}),
        ...(availableParam ? { available: availableParam.toLowerCase() === 'true' } : {}),
        ...(offerOnly ? { NOT: { offerPrice: null } } : {}),
      },
      orderBy: { createdAt: 'desc' },
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
      status: String(s.status),
      available: !!s.available,
      startDate: s.startDate ? s.startDate.toISOString() : undefined,
      endDate: s.endDate ? s.endDate.toISOString() : undefined,
      isOffer: !!s.isOffer,
    }))

    return NextResponse.json({ ok: true, services: dto })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

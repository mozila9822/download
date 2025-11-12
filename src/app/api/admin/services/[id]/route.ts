import { NextRequest, NextResponse } from 'next/server'
import { prismaOrNull } from '@/lib/db'
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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const client = await prismaOrNull()
    if (!client) {
      return NextResponse.json({ ok: false, error: 'Database unreachable. Please verify DATABASE_URL and network access.' }, { status: 500 })
    }

    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null
    const isAdmin = session ? canAccessAdmin(String(session.role) as any) : false
    if (!isAdmin) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json().catch(() => ({}))

    const data: any = {}
    if (body.category) {
      const cat = mapCategoryParam(String(body.category))
      if (!cat) return NextResponse.json({ ok: false, error: 'Invalid category.' }, { status: 400 })
      data.category = cat
    }
    if (body.title) data.title = String(body.title)
    if (body.description) data.description = String(body.description)
    if (body.price != null) {
      const n = Number(body.price)
      if (Number.isNaN(n)) return NextResponse.json({ ok: false, error: 'Invalid price.' }, { status: 400 })
      data.price = n
    }
    if (body.offerPrice !== undefined) {
      const v = body.offerPrice
      data.offerPrice = v != null ? Number(v) : null
    }
    if (body.location) data.location = String(body.location)
    if (body.imageUrl) data.imageUrl = String(body.imageUrl)
    if (body.status) {
      const s = String(body.status)
      if (!['Active', 'Inactive', 'Archived'].includes(s)) {
        return NextResponse.json({ ok: false, error: 'Invalid status.' }, { status: 400 })
      }
      data.status = s
    }
    if (body.available !== undefined) data.available = !!body.available
    if (body.startDate !== undefined) {
      data.startDate = body.startDate ? new Date(String(body.startDate)) : null
    }
    if (body.endDate !== undefined) {
      data.endDate = body.endDate ? new Date(String(body.endDate)) : null
    }
    if (body.isOffer !== undefined) data.isOffer = !!body.isOffer

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ ok: false, error: 'No fields to update.' }, { status: 400 })
    }

    const updated = await client.service.update({ where: { id }, data })

    const dto = {
      id: updated.id,
      category: mapDbCategoryToUi(String(updated.category)),
      title: updated.title,
      description: updated.description,
      price: updated.price,
      offerPrice: updated.offerPrice ?? undefined,
      location: updated.location,
      imageUrl: updated.imageUrl,
      status: String(updated.status),
      available: !!updated.available,
      startDate: updated.startDate ? updated.startDate.toISOString() : undefined,
      endDate: updated.endDate ? updated.endDate.toISOString() : undefined,
      isOffer: !!updated.isOffer,
    }

    return NextResponse.json({ ok: true, service: dto })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const client = await prismaOrNull()
    if (!client) {
      return NextResponse.json({ ok: false, error: 'Database unreachable. Please verify DATABASE_URL and network access.' }, { status: 500 })
    }

    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null
    const isAdmin = session ? canAccessAdmin(String(session.role) as any) : false
    if (!isAdmin) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await client.service.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

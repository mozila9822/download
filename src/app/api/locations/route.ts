import { NextRequest } from 'next/server'
import { locations } from '@/lib/locations'
import { airports } from '@/lib/airports'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim().toLowerCase()
    const limitParam = searchParams.get('limit') || '7'
    const limit = Math.max(1, Math.min(25, Number.isFinite(Number(limitParam)) ? Number(limitParam) : 7))
    const type = (searchParams.get('type') || 'all').toLowerCase()

    const source = type === 'airport' ? airports : type === 'city' ? locations : [...airports, ...locations]

    const data = (q.length < 1
      ? source
      : source.filter((l) => (
          l.name.toLowerCase().includes(q) ||
          (l.city && l.city.toLowerCase().includes(q)) ||
          l.country.toLowerCase().includes(q) ||
          l.code.toLowerCase().includes(q)
        )))
      .slice(0, limit)

    return Response.json(data)
  } catch (e) {
    console.error('[GET /api/locations] error', e)
    return Response.json({ ok: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

import { NextRequest } from 'next/server'
import { prismaOrNull } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const client = await prismaOrNull()
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim().toLowerCase()
    if (!client) {
      const fallback = [
        { slug: 'uk', name: 'United Kingdom' },
        { slug: 'europe', name: 'Europe' },
        { slug: 'asia', name: 'Asia' },
        { slug: 'africa', name: 'Africa' },
        { slug: 'americas', name: 'Americas' },
        { slug: 'oceania', name: 'Oceania' },
      ]
      const list = fallback.filter(d => !q || d.name.toLowerCase().includes(q))
      return Response.json(list)
    }
    const destModel = (client as any).destination
    if (!destModel || !destModel.findMany) return Response.json(fallback)
    const rows = await destModel.findMany({ orderBy: { name: 'asc' } })
    const list = rows.map((r: any) => ({ slug: r.slug, name: r.name }))
    return Response.json(q ? list.filter(d => d.name.toLowerCase().includes(q)) : list)
  } catch (e) {
    return Response.json({ ok: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

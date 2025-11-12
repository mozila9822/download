import { NextRequest } from 'next/server'
import { getSiteSettings, toPublicSettings, updateSiteSettings } from '@/lib/settings'
import { prismaOrNull } from '@/lib/db'

export async function GET(_req: NextRequest) {
  try {
    const settings = await getSiteSettings()
    return Response.json(toPublicSettings(settings))
  } catch (e) {
    console.error('[GET /api/settings] error', e)
    return new Response('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const db = await prismaOrNull()
    if (!db) {
      return Response.json({ ok: false, error: 'Database not configured or unreachable.' }, { status: 503 })
    }
    const payload = await req.json().catch(() => ({}))
    const updated = await updateSiteSettings(payload)
    return Response.json({ ok: true, settings: toPublicSettings(updated) })
  } catch (e) {
    console.error('[PATCH /api/settings] error', e)
    return new Response('Internal Server Error', { status: 500 })
  }
}

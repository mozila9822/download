import { NextRequest } from 'next/server'
import { getSiteSettings, toPublicSettings } from '@/lib/settings'

export async function GET(_req: NextRequest) {
  try {
    const settings = await getSiteSettings()
    return Response.json(toPublicSettings(settings))
  } catch (e) {
    console.error('[GET /api/settings] error', e)
    return new Response('Internal Server Error', { status: 500 })
  }
}

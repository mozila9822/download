import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME, verifySessionToken, canAccessAdmin } from '@/lib/auth'
import { getSiteSettings, updateSiteSettings } from '@/lib/settings'

function isValidUrl(url: string): boolean {
  try {
    if (url.startsWith('/')) return true
    new URL(url)
    return true
  } catch {
    return false
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null
    const isAdmin = session ? canAccessAdmin(String(session.role) as any) : false
    if (!isAdmin) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await getSiteSettings()
    return NextResponse.json({ ok: true, settings })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null
    const isAdmin = session ? canAccessAdmin(String(session.role) as any) : false
    if (!isAdmin) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const siteTitle: string | undefined = body.siteTitle
    if (!siteTitle || !siteTitle.trim()) {
      return NextResponse.json({ ok: false, error: 'Site title is required.' }, { status: 400 })
    }

    const payload = {
      siteTitle,
      domains: Array.isArray(body.domains) ? body.domains.filter((d: string) => !!d && d.trim().length > 0) : undefined,
      logoUrl: typeof body.logoUrl === 'string' ? body.logoUrl : undefined,
      faviconUrl: typeof body.faviconUrl === 'string' ? body.faviconUrl : undefined,
      footer: body.footer,
      navigation: Array.isArray(body.navigation)
        ? body.navigation.filter((i: any) => i && typeof i.label === 'string' && typeof i.href === 'string' && typeof i.visible === 'boolean')
        : undefined,
      sections: Array.isArray(body.sections)
        ? body.sections.filter((i: any) => i && typeof i.name === 'string' && typeof i.href === 'string' && typeof i.visible === 'boolean')
        : undefined,
      theme: body.theme,
      seoTitle: typeof body.seoTitle === 'string' ? body.seoTitle : undefined,
      seoDescription: typeof body.seoDescription === 'string' ? body.seoDescription : undefined,
      seoKeywords: typeof body.seoKeywords === 'string' ? body.seoKeywords : undefined,
    }

    // basic URL validation for navigation and social links
    for (const item of payload.navigation ?? []) {
      if (!isValidUrl(item.href)) {
        return NextResponse.json({ ok: false, error: `Invalid URL for navigation item: ${item.href}` }, { status: 400 })
      }
    }
    for (const item of payload.sections ?? []) {
      if (!isValidUrl(item.href)) {
        return NextResponse.json({ ok: false, error: `Invalid URL for section: ${item.href}` }, { status: 400 })
      }
    }

    const updated = await updateSiteSettings(payload)
    return NextResponse.json({ ok: true, settings: updated })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

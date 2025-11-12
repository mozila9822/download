import { NextRequest, NextResponse } from 'next/server'
import { prismaOrNull } from '@/lib/db'
import { SESSION_COOKIE_NAME, verifySessionToken, canAccessAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const client = await prismaOrNull()
    if (!client) return NextResponse.json({ ok: false, error: 'Database unreachable' }, { status: 503 })

    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null
    const isAdmin = session ? canAccessAdmin(String(session.role) as any) : false
    if (!isAdmin) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const serviceId = searchParams.get('serviceId') || undefined
    const category = searchParams.get('category') || undefined
    const activeParam = searchParams.get('active') || undefined
    const where: any = {}
    if (serviceId) where.serviceId = serviceId
    if (category) where.category = category
    if (activeParam != null) where.active = activeParam.toLowerCase() === 'true'

    const model = (client as any).pricingRule
    if (!model || !model.findMany) return NextResponse.json({ ok: true, rules: [] })
    const rows = await model.findMany({ where, orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }] })
    return NextResponse.json({ ok: true, rules: rows })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const client = await prismaOrNull()
    if (!client) return NextResponse.json({ ok: false, error: 'Database unreachable' }, { status: 503 })

    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null
    const isAdmin = session ? canAccessAdmin(String(session.role) as any) : false
    if (!isAdmin) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const payload: any = {}
    if (body.serviceId) payload.serviceId = String(body.serviceId)
    if (body.category) payload.category = String(body.category)
    if (body.name) payload.name = String(body.name)
    if (body.active !== undefined) payload.active = !!body.active
    if (body.startDate !== undefined) payload.startDate = body.startDate ? new Date(String(body.startDate)) : null
    if (body.endDate !== undefined) payload.endDate = body.endDate ? new Date(String(body.endDate)) : null
    if (body.weekendOnly !== undefined) payload.weekendOnly = !!body.weekendOnly
    if (body.multiplier !== undefined) payload.multiplier = body.multiplier != null ? Number(body.multiplier) : null
    if (body.fixedOverride !== undefined) payload.fixedOverride = body.fixedOverride != null ? Number(body.fixedOverride) : null
    if (body.priority !== undefined) payload.priority = Number(body.priority)

    const model = (client as any).pricingRule
    if (!model || !model.create) return NextResponse.json({ ok: false, error: 'PricingRule model not available' }, { status: 503 })
    const created = await model.create({ data: payload })
    return NextResponse.json({ ok: true, rule: created }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

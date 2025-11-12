import { NextRequest, NextResponse } from 'next/server'
import { prismaOrNull } from '@/lib/db'
import { SESSION_COOKIE_NAME, verifySessionToken, canAccessAdmin } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await prismaOrNull()
    if (!client) return NextResponse.json({ ok: false, error: 'Database unreachable' }, { status: 503 })

    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null
    const isAdmin = session ? canAccessAdmin(String(session.role) as any) : false
    if (!isAdmin) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const data: any = {}
    if (body.serviceId !== undefined) data.serviceId = body.serviceId ? String(body.serviceId) : null
    if (body.category !== undefined) data.category = body.category ? String(body.category) : null
    if (body.name !== undefined) data.name = String(body.name)
    if (body.active !== undefined) data.active = !!body.active
    if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(String(body.startDate)) : null
    if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(String(body.endDate)) : null
    if (body.weekendOnly !== undefined) data.weekendOnly = !!body.weekendOnly
    if (body.multiplier !== undefined) data.multiplier = body.multiplier != null ? Number(body.multiplier) : null
    if (body.fixedOverride !== undefined) data.fixedOverride = body.fixedOverride != null ? Number(body.fixedOverride) : null
    if (body.priority !== undefined) data.priority = Number(body.priority)

    const model = (client as any).pricingRule
    if (!model || !model.update) return NextResponse.json({ ok: false, error: 'PricingRule model not available' }, { status: 503 })
    const updated = await model.update({ where: { id: params.id }, data })
    return NextResponse.json({ ok: true, rule: updated })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await prismaOrNull()
    if (!client) return NextResponse.json({ ok: false, error: 'Database unreachable' }, { status: 503 })

    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null
    const isAdmin = session ? canAccessAdmin(String(session.role) as any) : false
    if (!isAdmin) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

    const model = (client as any).pricingRule
    if (!model || !model.delete) return NextResponse.json({ ok: false, error: 'PricingRule model not available' }, { status: 503 })
    await model.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

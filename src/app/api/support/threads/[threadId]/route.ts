import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME, verifySessionToken, canAccessAdmin } from '@/lib/auth'
import { updateThread } from '@/lib/support'
import type { SupportStatus } from '@/lib/types'

export async function PATCH(req: NextRequest, { params }: { params: { threadId: string } }) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    if (!token) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    const session = await verifySessionToken(token)
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    if (!canAccessAdmin(session.role)) return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })

    const body = await req.json().catch(() => ({}))
    const statusStr: string | undefined = body.status
    const assignAdminEmail: string | undefined = body.assignAdminEmail
    const allowed: SupportStatus[] = ['Open', 'InProgress', 'Pending', 'Resolved', 'Urgent']
    const status: SupportStatus | undefined = statusStr && allowed.includes(statusStr as any) ? (statusStr as SupportStatus) : undefined

    const updated = await updateThread(params.threadId, { status, assignAdminEmail })
    if (!updated) return NextResponse.json({ ok: false, error: 'Unable to update thread' }, { status: 500 })
    return NextResponse.json({ ok: true, thread: updated })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Internal Server Error' }, { status: 500 })
  }
}


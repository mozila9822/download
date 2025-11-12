import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth'
import { markMessageRead } from '@/lib/support'

export async function PATCH(req: NextRequest, { params }: { params: { messageId: string } }) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    if (!token) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    const session = await verifySessionToken(token)
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

    const by = session.role === 'Admin' || session.role === 'Staff' || session.role === 'SuperAdmin' || session.role === 'master_admin' ? 'admin' : 'user'
    const ok = await markMessageRead(params.messageId, by)
    if (!ok) return NextResponse.json({ ok: false, error: 'Unable to update read status' }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Internal Server Error' }, { status: 500 })
  }
}


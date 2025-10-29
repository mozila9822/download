import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth'
import { listThreadsForAdmin, listThreadsForUser, createThread } from '@/lib/support'
import type { CreateThreadPayload } from '@/lib/types'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    if (!token) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    const session = await verifySessionToken(token)
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

    const isAdmin = session.role === 'Admin' || session.role === 'Staff' || session.role === 'SuperAdmin' || session.role === 'master_admin'
    const threads = isAdmin ? await listThreadsForAdmin() : await listThreadsForUser(session.email)
    return NextResponse.json({ ok: true, threads })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    if (!token) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    const session = await verifySessionToken(token)
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

    const body = (await req.json().catch(() => ({}))) as Partial<CreateThreadPayload>
    const messageText = (body.messageText || '').trim()
    if (!messageText) return NextResponse.json({ ok: false, error: 'Message text is required.' }, { status: 400 })
    const subject = (body.subject || '').trim() || undefined
    const attachments = Array.isArray(body.attachments) ? body.attachments : undefined

    const result = await createThread(session.email, { subject, messageText, attachments })
    if (!result) return NextResponse.json({ ok: false, error: 'Unable to create thread' }, { status: 500 })
    return NextResponse.json({ ok: true, thread: result.thread, firstMessage: result.firstMessage })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Internal Server Error' }, { status: 500 })
  }
}


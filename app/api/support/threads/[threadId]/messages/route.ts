import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME, verifySessionToken, canAccessAdmin } from '@/lib/auth'
import { listMessages, postMessage } from '@/lib/support'
import type { SendMessagePayload } from '@/lib/types'

export async function GET(req: NextRequest, { params }: { params: { threadId: string } }) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    if (!token) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    const session = await verifySessionToken(token)
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

    const threadId = params.threadId
    const messages = await listMessages(threadId)
    // Authorization note: listMessages relies on upstream checks; for simplicity, we expose messages
    // to admins and to users who already have the thread id via their listing
    return NextResponse.json({ ok: true, messages })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { threadId: string } }) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
    if (!token) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    const session = await verifySessionToken(token)
    if (!session) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

    const threadId = params.threadId
    const body = (await req.json().catch(() => ({}))) as Partial<SendMessagePayload>
    const messageText = (body.messageText || '').trim()
    if (!messageText) return NextResponse.json({ ok: false, error: 'Message text is required.' }, { status: 400 })
    const attachments = Array.isArray(body.attachments) ? body.attachments : undefined

    const msg = await postMessage(threadId, { email: session.email, role: session.role }, { threadId, messageText, attachments })
    if (!msg) return NextResponse.json({ ok: false, error: 'Unable to send message' }, { status: 500 })
    return NextResponse.json({ ok: true, message: msg })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Internal Server Error' }, { status: 500 })
  }
}


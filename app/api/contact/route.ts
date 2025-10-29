import { NextResponse } from 'next/server';
import { createThread } from '@/lib/support';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const subject = String(body.subject || 'Contact Request').trim();
    const messageText = String(body.messageText || '').trim();

    if (!messageText) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: 'Email is required for contact' }, { status: 400 });
    }

    const result = await createThread(email, { subject, messageText });
    if (!result) {
      return NextResponse.json(
        { error: 'Please sign in with this email to contact support.' },
        { status: 401 }
      );
    }

    return NextResponse.json({ ok: true, threadId: result.thread.id });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to submit contact request' }, { status: 500 });
  }
}


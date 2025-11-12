import { NextRequest } from 'next/server'
import { prismaOrNull } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const input = await req.json().catch(() => ({}))
    const email: string | undefined = input.email
    const name: string | undefined = input.name
    if (!email) {
      return new Response('Missing email', { status: 400 })
    }

    const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0
    const client = await prismaOrNull()
    if (!isDbConfigured || !client) {
      return Response.json({ ok: true, message: `Dev fallback: ${email} granted SuperAdmin (not persisted)` })
    }

    await client.user.upsert({
      where: { email },
      update: { role: 'SuperAdmin' as any, name },
      create: { email, name, role: 'SuperAdmin' as any },
    })

    return Response.json({ ok: true, message: `${email} is now SuperAdmin` })
  } catch (e: any) {
    console.error('[POST /api/admin/grant-superadmin] error', e)
    return new Response(e?.message || 'Internal Server Error', { status: 500 })
  }
}

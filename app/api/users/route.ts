import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { clients as fallbackClients } from '@/lib/data'

type UserDto = {
  id: number
  firstName: string
  lastName: string
  email: string
  role: 'Admin' | 'Staff' | 'User' | 'SuperAdmin'
  company?: string
  status: 'Active' | 'Inactive'
  addedDate: string
}

function splitName(name?: string): { firstName: string; lastName: string } {
  if (!name || !name.trim()) return { firstName: '', lastName: '' }
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

function parseRoles(param?: string | null): Array<'Admin' | 'Staff' | 'User' | 'SuperAdmin'> | undefined {
  if (!param) return undefined
  const parts = param.split(',').map((p) => p.trim()).filter(Boolean)
  const valid = ['Admin', 'Staff', 'User', 'SuperAdmin'] as const
  const roles = parts.filter((p): p is typeof valid[number] => (valid as readonly string[]).includes(p))
  return roles.length ? roles : undefined
}

const fallbackWorkers: UserDto[] = [
  {
    id: 101,
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@voyagehub.io',
    role: 'Admin',
    status: 'Active',
    addedDate: '2023-09-01',
  },
  {
    id: 102,
    firstName: 'Bob',
    lastName: 'Smith',
    email: 'bob.smith@voyagehub.io',
    role: 'Staff',
    status: 'Active',
    addedDate: '2023-10-05',
  },
  {
    id: 103,
    firstName: 'Charlie',
    lastName: 'Lee',
    email: 'charlie.lee@voyagehub.io',
    role: 'Staff',
    status: 'Inactive',
    addedDate: '2023-08-18',
  },
  // Added per request: Admin account for antobar876@gmail.com
  {
    id: 104,
    firstName: 'Anto',
    lastName: 'Bar',
    email: 'antobar876@gmail.com',
    role: 'SuperAdmin',
    status: 'Active',
    addedDate: new Date().toISOString().split('T')[0],
  },
]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const roles = parseRoles(searchParams.get('role'))
    const emailParam = searchParams.get('email')?.trim().toLowerCase() || null

    const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0

    if (!isDbConfigured || !prisma) {
      const fallbackClientsDto: UserDto[] = fallbackClients.map((c) => {
        const { firstName, lastName } = splitName(c.name)
        return {
          id: parseInt(c.id, 10),
          firstName,
          lastName,
          email: c.email,
          role: 'User',
          company: c.company,
          status: c.status,
          addedDate: c.addedDate,
        }
      })

      let combined = [...fallbackWorkers, ...fallbackClientsDto]
      if (emailParam) {
        combined = combined.filter((u) => (u.email || '').toLowerCase() === emailParam)
      }
      const filtered = roles ? combined.filter((u) => roles.includes(u.role)) : combined
      return Response.json(filtered)
    }

    const rows = await prisma.user.findMany({
      where: {
        ...(roles ? { role: { in: roles as any } } : {}),
        ...(emailParam ? { email: emailParam } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })

    const dto: UserDto[] = rows.map((u) => {
      const { firstName, lastName } = splitName(u.name ?? undefined)
      return {
        id: Number(u.id as any),
        firstName,
        lastName,
        email: u.email,
        role: u.role as any,
        status: 'Active',
        addedDate: u.createdAt.toISOString().split('T')[0],
      }
    })

    return Response.json(dto)
  } catch (e) {
    console.error('[GET /api/users] error', e)
    return new Response('Internal Server Error', { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0
    const input = await req.json().catch(() => ({}))
    const email: string | undefined = input.email
    const name: string | undefined = input.name
    const password: string | undefined = input.password
    const role: 'Admin' | 'Staff' | 'User' | 'SuperAdmin' = input.role ?? 'User'
    const phone: string | undefined = input.phone
    const address: string | undefined = input.address

    if (!email) {
      return new Response('Missing email', { status: 400 })
    }
    if (!name || !name.trim()) {
      return new Response('Missing name', { status: 400 })
    }
    if (!phone || !phone.trim()) {
      return new Response('Missing phone', { status: 400 })
    }
    if (!address || !address.trim()) {
      return new Response('Missing address', { status: 400 })
    }
    if (!password || !password.trim()) {
      return new Response('Missing password', { status: 400 })
    }

    if (!isDbConfigured || !prisma) {
      const { firstName, lastName } = splitName(name ?? email.split('@')[0])
      const dto: UserDto = {
        id: 'temp-' + Math.random().toString(36).slice(2),
        firstName,
        lastName,
        email,
        role,
        status: 'Active',
        addedDate: new Date().toISOString().split('T')[0],
      }
      return Response.json(dto, { status: 201 })
    }

    const created = await prisma.user.create({
      data: {
        email,
        name,
        phone,
        address,
        role,
        passwordHash: password ? await bcrypt.hash(password, 12) : undefined,
      },
    })

    const { firstName, lastName } = splitName(created.name ?? undefined)
    const dto: UserDto = {
      id: Number(created.id as any),
      firstName,
      lastName,
      email: created.email,
      role: created.role as any,
      status: 'Active',
      addedDate: created.createdAt.toISOString().split('T')[0],
    }
    return Response.json(dto, { status: 201 })
  } catch (e) {
    console.error('[POST /api/users] error', e)
    return new Response('Internal Server Error', { status: 500 })
  }
}

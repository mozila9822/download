import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prismaOrNull } from '@/lib/db'
import { clients as fallbackClients } from '@/lib/data'
import mysql from 'mysql2/promise'

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

    const db = await prismaOrNull()
    // Allow disabling sample/fallback users via env to ensure DB-only data
    const disableFallback = String(process.env.DISABLE_USER_FALLBACK || '').toLowerCase() === 'true'
    if (!db) {
      if (disableFallback) {
        // Attempt direct MySQL query if Prisma is unavailable, still DB-only
        const host = process.env.MYSQL_HOST
        const userEnv = process.env.MYSQL_USER
        const passwordEnv = process.env.MYSQL_PASSWORD
        const database = process.env.MYSQL_DATABASE
        const port = Number(process.env.MYSQL_PORT || 3306)
        if (host && userEnv && passwordEnv && database) {
          let conn: mysql.Connection | null = null
          try {
            conn = await mysql.createConnection({ host, user: userEnv, password: passwordEnv, database, port })
            const whereClauses: string[] = []
            const params: any[] = []
            if (roles && roles.length) {
              whereClauses.push(`role IN (${roles.map(() => '?').join(',')})`)
              params.push(...roles)
            }
            if (emailParam) {
              whereClauses.push('LOWER(email) = ?')
              params.push(emailParam)
            }
            const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''
            const [rows] = await conn.query<any[]>(
              `SELECT id, email, role, name, createdAt FROM \`User\` ${whereSql} ORDER BY createdAt DESC`,
              params
            )
            const dto: UserDto[] = (Array.isArray(rows) ? rows : []).map((u) => {
              const { firstName, lastName } = splitName(u.name ?? undefined)
              return {
                id: Number(u.id as any),
                firstName,
                lastName,
                email: String(u.email),
                role: String(u.role) as any,
                status: 'Active',
                addedDate: new Date(u.createdAt || Date.now()).toISOString().split('T')[0],
              }
            })
            return Response.json(dto)
          } catch (e) {
            console.error('[GET /api/users] mysql fallback error', e)
            return Response.json([])
          } finally {
            if (conn) await conn.end().catch(() => {})
          }
        }
        // When disabled and no direct DB creds, return empty list to avoid showing non-DB users
        return Response.json([])
      }
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

    const rows = await db.user.findMany({
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

    const db = await prismaOrNull()
    if (!db) {
      // Attempt direct MySQL fallback when Prisma engine is unavailable
      const host = process.env.MYSQL_HOST
      const userEnv = process.env.MYSQL_USER
      const passwordEnv = process.env.MYSQL_PASSWORD
      const database = process.env.MYSQL_DATABASE
      const port = Number(process.env.MYSQL_PORT || 3306)
      if (!host || !userEnv || !passwordEnv || !database) {
        const { firstName, lastName } = splitName(name ?? email.split('@')[0])
        const dto: UserDto = {
          id: 'temp-' + Math.random().toString(36).slice(2) as any,
          firstName,
          lastName,
          email,
          role,
          status: 'Active',
          addedDate: new Date().toISOString().split('T')[0],
        }
        return Response.json(dto, { status: 201 })
      }
      let conn: mysql.Connection | null = null
      try {
        conn = await mysql.createConnection({ host, user: userEnv, password: passwordEnv, database, port })
        const normalizedEmail = email.trim().toLowerCase()
        const [existingRows] = await conn.query<any[]>(
          'SELECT id FROM `User` WHERE email = ? LIMIT 1',
          [normalizedEmail]
        )
        if (Array.isArray(existingRows) && existingRows.length) {
          return new Response('Email already registered', { status: 409 })
        }
        const passwordHash = await bcrypt.hash(password, 12)
        const [result] = await conn.execute<any>(
          'INSERT INTO `User` (email, name, phone, address, role, passwordHash, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [normalizedEmail, name, phone, address, role, passwordHash]
        )
        const insertedId = Number((result && result.insertId) || 0)
        const { firstName, lastName } = splitName(name ?? undefined)
        const dto: UserDto = {
          id: insertedId || ('temp-' + Math.random().toString(36).slice(2)) as any,
          firstName,
          lastName,
          email: normalizedEmail,
          role,
          status: 'Active',
          addedDate: new Date().toISOString().split('T')[0],
        }
        return Response.json(dto, { status: 201 })
      } catch (err: any) {
        const msg = err?.message || String(err)
        if (msg.includes('ER_DUP_ENTRY')) {
          return new Response('Email already registered', { status: 409 })
        }
        console.error('[POST /api/users] mysql create error', err)
        return new Response('Internal Server Error', { status: 500 })
      } finally {
        if (conn) await conn.end().catch(() => {})
      }
    }

    let created
    try {
      created = await db.user.create({
        data: {
          email,
          name,
          phone,
          address,
          role,
          passwordHash: password ? await bcrypt.hash(password, 12) : undefined,
        },
      })
    } catch (err: any) {
      // Handle unique constraint violation on email gracefully
      if (err && err.code === 'P2002' && Array.isArray(err.meta?.target) ? err.meta?.target.includes('email') : String(err.meta?.target || '').includes('email')) {
        return new Response('Email already registered', { status: 409 })
      }
      console.error('[POST /api/users] create error', err)
      return new Response('Internal Server Error', { status: 500 })
    }

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

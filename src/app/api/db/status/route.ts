import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import { prismaOrNull, getPrismaLastError } from '@/lib/db'

export async function GET(_req: NextRequest) {
  const resp: any = {
    ok: false,
    prisma: { envPresent: false, reachable: false, error: null as string | null, host: null as string | null, port: null as number | null, directReachable: false, directError: null as string | null, latencyMs: null as number | null },
    mysql: { envPresent: false, reachable: false, error: null as string | null },
    missingEnv: [] as string[],
  }

  // Prisma via DATABASE_URL
  const dbUrl = (process.env.DATABASE_URL || '').trim()
  resp.prisma.envPresent = dbUrl.length > 0
  if (!resp.prisma.envPresent) resp.missingEnv.push('DATABASE_URL')
  // Parse host/port from DATABASE_URL for clarity
  if (resp.prisma.envPresent) {
    try {
      const url = new URL(dbUrl)
      resp.prisma.host = url.hostname || null
      resp.prisma.port = url.port ? Number(url.port) : 3306
    } catch (_) {
      // Ignore parse errors
    }
  }
  try {
    const prisma = await prismaOrNull()
    if (prisma) {
      resp.prisma.reachable = true
    } else if (resp.prisma.envPresent) {
      resp.prisma.error = getPrismaLastError() || 'Prisma client could not connect.'
    }
  } catch (e: any) {
    resp.prisma.error = e?.message || 'Prisma check failed'
  }

  // Try direct MySQL connection using DATABASE_URL (if parseable)
  if (resp.prisma.envPresent) {
    let connFromUrl: mysql.Connection | null = null
    try {
      const start = Date.now()
      // mysql2 supports URI
      connFromUrl = await mysql.createConnection(dbUrl)
      await connFromUrl.query('SELECT 1')
      resp.prisma.directReachable = true
      resp.prisma.latencyMs = Date.now() - start
    } catch (e: any) {
      resp.prisma.directError = e?.message || 'Direct MySQL via DATABASE_URL failed'
    } finally {
      if (connFromUrl) await connFromUrl.end().catch(() => {})
    }
  }

  // Direct MySQL via MYSQL_* envs
  const host = process.env.MYSQL_HOST
  const user = process.env.MYSQL_USER
  const password = process.env.MYSQL_PASSWORD
  const database = process.env.MYSQL_DATABASE
  const port = Number(process.env.MYSQL_PORT || 3306)
  resp.mysql.envPresent = !!host && !!user && !!password && !!database
  if (!host) resp.missingEnv.push('MYSQL_HOST')
  if (!user) resp.missingEnv.push('MYSQL_USER')
  if (!password) resp.missingEnv.push('MYSQL_PASSWORD')
  if (!database) resp.missingEnv.push('MYSQL_DATABASE')

  let conn: mysql.Connection | null = null
  if (resp.mysql.envPresent) {
    try {
      const start = Date.now()
      conn = await mysql.createConnection({ host, user, password, database, port })
      const [[ver]] = await conn.query<any[]>("SELECT VERSION() AS version")
      resp.mysql.reachable = true
      resp.version = ver?.version || null
      resp.latencyMs = Date.now() - start
    } catch (e: any) {
      resp.mysql.error = e?.message || 'MySQL connection failed'
    } finally {
      if (conn) await conn.end().catch(() => {})
    }
  }

  resp.ok = resp.prisma.reachable || resp.mysql.reachable
  return NextResponse.json(resp)
}

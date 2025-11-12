import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const params = url.searchParams

  const host = params.get('host') ?? process.env.MYSQL_HOST
  const user = process.env.MYSQL_USER
  const password = process.env.MYSQL_PASSWORD
  const database = process.env.MYSQL_DATABASE
  const portStr = params.get('port') ?? process.env.MYSQL_PORT
  const port = portStr ? Number(portStr) : 3306

  if (!host || !user || !password || !database) {
    return NextResponse.json({ ok: false, error: 'Missing MySQL env vars (MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE). Optionally pass host/port as query params.' }, { status: 500 })
  }

  let conn: mysql.Connection | null = null
  const results: { sql: string; ok: boolean; error?: string }[] = []
  try {
    conn = await mysql.createConnection({ host, user, password, database, port })

    const queries = [
      "SET FOREIGN_KEY_CHECKS=0",
      "ALTER TABLE `User` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
      "ALTER TABLE `Service` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
      "ALTER TABLE `Booking` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
      // Add FKs (idempotent-ish: ignore if already exists)
      "ALTER TABLE `Booking` ADD CONSTRAINT `Booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE",
      "ALTER TABLE `Booking` ADD CONSTRAINT `Booking_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE",
      "SET FOREIGN_KEY_CHECKS=1",
    ]

    for (const sql of queries) {
      try {
        await conn.query(sql)
        results.push({ sql, ok: true })
      } catch (e: any) {
        results.push({ sql, ok: false, error: e?.message || String(e) })
      }
    }

    return NextResponse.json({ ok: true, host, port, database, results })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  } finally {
    if (conn) await conn.end().catch(() => {})
  }
}


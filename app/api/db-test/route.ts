import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const params = url.searchParams

  const host = params.get('host') ?? process.env.MYSQL_HOST
  const user = params.get('user') ?? process.env.MYSQL_USER
  const password = params.get('password') ?? process.env.MYSQL_PASSWORD
  const database = params.get('database') ?? process.env.MYSQL_DATABASE
  const portStr = params.get('port') ?? process.env.MYSQL_PORT
  const port = portStr ? Number(portStr) : 3306
  const inspectTable = params.get('table')

  if (!host || !user || !password || !database) {
    return NextResponse.json({ ok: false, error: 'Missing MySQL connection details. Provide env vars (MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE) or query params (host,user,password,database).' }, { status: 500 })
  }

  let conn: mysql.Connection | null = null
  try {
    conn = await mysql.createConnection({ host, user, password, database, port })

    const [[versionRow]] = await conn.query<{ version: string }[]>("SELECT VERSION() AS version")
    const [[nowRow]] = await conn.query<{ now: string }[]>("SELECT NOW() AS now")
    const [[dbRow]] = await conn.query<{ db: string }[]>("SELECT DATABASE() AS db")
    const [tables] = await conn.query<any[]>("SHOW TABLES")

    let tableCreate: any | null = null
    let tableColumns: any[] | null = null
    if (inspectTable) {
      try {
        const [[createRow]] = await conn.query<any[]>(`SHOW CREATE TABLE \`${inspectTable}\``)
        tableCreate = createRow
      } catch {}
      try {
        const [cols] = await conn.query<any[]>(`SHOW COLUMNS FROM \`${inspectTable}\``)
        tableColumns = Array.isArray(cols) ? cols : null
      } catch {}
    }

    const tablesPreview = Array.isArray(tables) ? tables.slice(0, 10) : []

    return NextResponse.json({
      ok: true,
      message: 'Connected to MariaDB/MySQL successfully',
      host,
      port,
      database: dbRow?.db,
      version: versionRow?.version,
      now: nowRow?.now,
      tablesCount: Array.isArray(tables) ? tables.length : 0,
      tablesPreview,
      ...(inspectTable ? { table: inspectTable, tableCreate, tableColumns } : {}),
    })
  } catch (e: any) {
    const error = e?.message || String(e)
    return NextResponse.json({ ok: false, error }, { status: 500 })
  } finally {
    if (conn) await conn.end().catch(() => {})
  }
}

import express from 'express'
import http from 'http'
import cors from 'cors'
import { Server } from 'socket.io'
import { jwtVerify } from 'jose'
import mysql from 'mysql2/promise'

const PORT = Number(process.env.CHAT_SERVER_PORT || 4000)
const ORIGIN = process.env.CHAT_SERVER_ORIGIN || 'http://localhost:9002'

type SessionPayload = {
  sub: string
  email: string
  role: 'User' | 'Admin' | 'Staff' | 'SuperAdmin' | 'master_admin'
  exp?: number
}

function getJwtSecret(): Uint8Array {
  const configured = process.env.JWT_SECRET || ''
  if (configured && configured.length >= 32) return new TextEncoder().encode(configured)
  if (process.env.NODE_ENV !== 'production') return new TextEncoder().encode('vh-dev-secret-do-not-use-in-prod-0123456789abcdef012345')
  throw new Error('JWT_SECRET must be set and at least 32 characters long')
}

async function verifyTokenFromCookie(headerCookie?: string): Promise<SessionPayload | null> {
  if (!headerCookie) return null
  const match = headerCookie.split(';').map(s => s.trim()).find(s => s.startsWith('vh_session='))
  if (!match) return null
  const token = match.slice('vh_session='.length)
  try {
    const secret = getJwtSecret()
    const { payload } = await jwtVerify(token, secret, { issuer: 'voyagehub', algorithms: ['HS256'] })
    return payload as any
  } catch {
    return null
  }
}

async function getMysqlConn() {
  const host = process.env.MYSQL_HOST
  const user = process.env.MYSQL_USER
  const password = process.env.MYSQL_PASSWORD
  const database = process.env.MYSQL_DATABASE
  const port = Number(process.env.MYSQL_PORT || 3306)
  if (!host || !user || !password || !database) return null
  try {
    const conn = await mysql.createConnection({ host, user, password, database, port })
    return conn
  } catch {
    return null
  }
}

const app = express()
app.use(cors({ origin: ORIGIN, credentials: true }))
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: ORIGIN, credentials: true } })

io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie as string | undefined
    const session = await verifyTokenFromCookie(cookieHeader)
    if (!session) return next(new Error('Unauthorized'))
    ;(socket as any).session = session
    next()
  } catch (e) {
    next(new Error('Unauthorized'))
  }
})

io.on('connection', async (socket) => {
  const session: SessionPayload = (socket as any).session
  const isAdmin = ['Admin', 'Staff', 'SuperAdmin', 'master_admin'].includes(session.role)

  // Default rooms: user-specific and admin broadcast
  socket.join(`user:${session.email}`)
  if (isAdmin) socket.join('admins')

  socket.on('support:join_thread', (threadId: string) => {
    if (!threadId) return
    socket.join(`thread:${threadId}`)
  })

  socket.on('support:typing', (threadId: string) => {
    if (!threadId) return
    socket.to(`thread:${threadId}`).emit('support:typing', { threadId, by: session.email, at: Date.now() })
  })

  socket.on('support:send_message', async (payload: { threadId: string; messageText: string; attachments?: any[] }) => {
    const { threadId, messageText, attachments } = payload || {}
    const text = (messageText || '').trim()
    if (!threadId || !text) return

    // Try MySQL insert; fallback to broadcast-only
    const conn = await getMysqlConn()
    let saved: any | null = null
    try {
      if (conn) {
        // Map user email to ID
        const [rows] = await conn.query<any[]>("SELECT id, email FROM `User` WHERE email = ? LIMIT 1", [session.email])
        const user = rows && rows[0]
        const now = new Date()
        if (isAdmin) {
          // Admin message
          await conn.query(
            "INSERT INTO `SupportMessage` (threadId, adminId, messageText, attachments, readByUser, readByAdmin, createdAt, id) VALUES (?, ?, ?, ?, ?, ?, ?, UUID())",
            [threadId, user?.id ?? null, text, attachments ? JSON.stringify(attachments) : null, true, false, now]
          )
        } else {
          await conn.query(
            "INSERT INTO `SupportMessage` (threadId, userId, messageText, attachments, readByUser, readByAdmin, createdAt, id) VALUES (?, ?, ?, ?, ?, ?, ?, UUID())",
            [threadId, user?.id ?? null, text, attachments ? JSON.stringify(attachments) : null, false, true, now]
          )
        }
        // Update thread updatedAt
        await conn.query("UPDATE `SupportThread` SET updatedAt = ? WHERE id = ?", [now, threadId])
        saved = {
          id: `mysql_${Math.random().toString(36).slice(2)}`,
          threadId,
          userId: isAdmin ? null : (user?.id ?? null),
          adminId: isAdmin ? (user?.id ?? null) : null,
          sender: isAdmin ? 'Admin' : 'User',
          messageText: text,
          attachments: attachments ?? null,
          readByUser: !isAdmin,
          readByAdmin: isAdmin,
          createdAt: now.toISOString(),
        }
      }
    } catch (e) {
      // ignore; will broadcast anyway
    } finally {
      if (conn) await conn.end().catch(() => {})
    }

    const message = saved ?? {
      id: `mem_${Math.random().toString(36).slice(2)}`,
      threadId,
      userId: isAdmin ? null : -1,
      adminId: isAdmin ? -1 : null,
      sender: isAdmin ? 'Admin' : 'User',
      messageText: text,
      attachments: attachments ?? null,
      readByUser: !isAdmin,
      readByAdmin: isAdmin,
      createdAt: new Date().toISOString(),
    }

    io.to(`thread:${threadId}`).emit('support:message', { message })
  })

  socket.on('disconnect', () => {
    // no-op
  })
})

// DB status publisher
setInterval(async () => {
  const start = Date.now()
  const conn = await getMysqlConn()
  let online = false
  let latency = null as number | null
  let version: string | null = null
  try {
    if (conn) {
      const [[ver]] = await conn.query<any[]>("SELECT VERSION() AS version")
      online = true
      version = ver?.version || null
      latency = Date.now() - start
    }
  } catch {
    online = false
  } finally {
    if (conn) await conn.end().catch(() => {})
  }
  io.to('admins').emit('db:status', { online, latency, version, at: Date.now() })
}, Number(process.env.DB_STATUS_INTERVAL_MS || 10000))

server.listen(PORT, () => {
  console.log(`[chat-server] listening on http://localhost:${PORT} (origin ${ORIGIN})`)
})


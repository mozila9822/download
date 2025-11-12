'use client'

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type DbStatus = { online: boolean; latency: number | null; version: string | null; at: number }
type Diagnostics = {
  ok: boolean
  prisma: { envPresent: boolean; reachable: boolean; error: string | null }
  mysql: { envPresent: boolean; reachable: boolean; error: string | null }
  missingEnv: string[]
  version?: string | null
  latencyMs?: number | null
}

function statusBadge(online: boolean) {
  return online ? (
    <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">
      <span className="size-2 rounded-full bg-emerald-500 animate-pulse" /> Online
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200">
      <span className="size-2 rounded-full bg-red-500" /> Offline
    </span>
  )
}

export default function DbStatusPage() {
  const [status, setStatus] = useState<DbStatus | null>(null)
  const [checking, setChecking] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [diag, setDiag] = useState<Diagnostics | null>(null)

  useEffect(() => {
    const s = io(process.env.NEXT_PUBLIC_CHAT_SERVER_URL || 'http://localhost:4000', { withCredentials: true })
    setSocket(s)
    s.on('db:status', (payload: DbStatus) => setStatus(payload))
    return () => { s.disconnect() }
  }, [])

  const manualCheck = async () => {
    setChecking(true)
    try {
      const res = await fetch('/api/db/status', { cache: 'no-store' })
      const data: Diagnostics = await res.json().catch(() => ({ ok: false, prisma: { envPresent: false, reachable: false, error: null }, mysql: { envPresent: false, reachable: false, error: null }, missingEnv: [] }))
      const online = !!(data?.mysql?.reachable || data?.prisma?.reachable)
      const latency = typeof data?.latencyMs === 'number' ? data.latencyMs : null
      const version = data?.version || null
      setStatus({ online, latency, version, at: Date.now() })
      setDiag(data)
    } catch {
      setStatus({ online: false, latency: null, version: null, at: Date.now() })
      setDiag(null)
    } finally {
      setChecking(false)
    }
  }

  const online = !!status?.online
  const missing = diag?.missingEnv || []
  const hasMissingEnv = missing.length > 0
  const prismaIssue = diag && !diag.prisma.reachable && diag.prisma.envPresent ? diag.prisma.error || 'Prisma could not connect.' : null
  const mysqlIssue = diag && !diag.mysql.reachable && diag.mysql.envPresent ? diag.mysql.error || 'MySQL connection failed.' : null

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>MySQL Database Status</CardTitle>
        <CardDescription>Live connection health, latency, and version. Status updates stream in real-time.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {statusBadge(online)}
            <div className="text-sm text-muted-foreground">{status?.version ? `MySQL ${status.version}` : 'Version unknown'}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={manualCheck} disabled={checking}>{checking ? 'Checking...' : 'Check Now'}</Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground">Latency</div>
            <div className="text-2xl font-semibold">{status?.latency != null ? `${status.latency} ms` : '—'}</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground">Updated</div>
            <div className="text-2xl font-semibold">{status?.at ? new Date(status.at).toLocaleTimeString() : '—'}</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground">Connection</div>
            <div className="text-2xl font-semibold">{online ? 'Healthy' : 'Degraded'}</div>
          </div>
        </div>

        <AnimatePresence>
          {!online && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="mt-6 p-4 rounded-lg border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/30"
            >
              <div className="font-medium text-red-700 dark:text-red-200">Database Disconnected</div>
              <div className="text-sm text-red-600 dark:text-red-300">
                {hasMissingEnv ? (
                  <span>Missing environment variables: {missing.join(', ')}. Add them to <code>.env.local</code> and restart.</span>
                ) : (
                  <span>Real-time alert: the MySQL database is unreachable. Check credentials or server availability.</span>
                )}
              </div>
              {!hasMissingEnv && (prismaIssue || mysqlIssue) && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {prismaIssue && <div>Prisma: {prismaIssue}</div>}
                  {mysqlIssue && <div>MySQL: {mysqlIssue}</div>}
                </div>
              )}
              <div className="mt-3">
                <Button variant="outline" onClick={manualCheck} disabled={checking}>{checking ? 'Checking...' : 'Re-run Diagnostics'}</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
     </CardContent>
    </Card>
  )
}

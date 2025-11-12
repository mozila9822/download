import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0

export const prisma: PrismaClient | null = isDbConfigured
  ? (global.prisma ?? new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL! } } }))
  : null

if (process.env.NODE_ENV !== 'production' && prisma) global.prisma = prisma

let reachableCache: { ok: boolean; at: number } = { ok: false, at: 0 }
const CACHE_MS = 15_000
let lastErrorMsg: string | null = null

export async function prismaOrNull(): Promise<PrismaClient | null> {
  if (!prisma) return null
  const now = Date.now()
  if (reachableCache.at && now - reachableCache.at < CACHE_MS) {
    return reachableCache.ok ? prisma : null
  }
  try {
    // Allow more time for remote DBs and initial Prisma engine spin-up
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('DB connect timeout')), 30000))
    await Promise.race([prisma.$connect(), timeout])
    reachableCache = { ok: true, at: now }
    lastErrorMsg = null
    return prisma
  } catch (e: any) {
    reachableCache = { ok: false, at: now }
    lastErrorMsg = e?.message || 'Unknown Prisma connect error'
    return null
  }
}

export function getPrismaLastError(): string | null {
  return lastErrorMsg
}

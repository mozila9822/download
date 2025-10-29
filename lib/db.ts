import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0

export const prisma: PrismaClient | null = isDbConfigured
  ? (global.prisma ?? new PrismaClient())
  : null

if (process.env.NODE_ENV !== 'production' && prisma) global.prisma = prisma

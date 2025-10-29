import { prisma } from '@/lib/db'
import type {
  SupportStatus,
  SupportAttachment,
  SupportThreadDto,
  SupportMessageDto,
  CreateThreadPayload,
  SendMessagePayload,
} from '@/lib/types'

const isDbConfigured = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0

// In-memory fallback stores (dev without DB)
let memoryThreads: SupportThreadDto[] = []
let memoryMessages: SupportMessageDto[] = []

function nowIso() {
  return new Date().toISOString()
}

export async function listThreadsForUser(userEmail: string): Promise<SupportThreadDto[]> {
  if (isDbConfigured && prisma) {
    try {
      const user = await prisma.user.findUnique({ where: { email: userEmail } })
      if (!user) return []
      const rows = await prisma.supportThread.findMany({
        where: { userId: Number(user.id as any) },
        orderBy: { updatedAt: 'desc' },
        include: { assignedAdmin: true, user: true },
      })
      return rows.map((t) => ({
        id: String(t.id),
        subject: t.subject ?? null,
        userId: Number(t.userId as any),
        userEmail: t.user?.email,
        assignedAdminId: t.assignedAdminId ?? null,
        assignedAdminEmail: t.assignedAdmin?.email ?? null,
        status: t.status as SupportStatus,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      }))
    } catch {
      // Fall back if query fails
    }
  }
  return memoryThreads.filter((t) => t.userEmail === userEmail).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function listThreadsForAdmin(): Promise<SupportThreadDto[]> {
  if (isDbConfigured && prisma) {
    try {
      const rows = await prisma.supportThread.findMany({
        orderBy: { updatedAt: 'desc' },
        include: { assignedAdmin: true, user: true },
      })
      return rows.map((t) => ({
        id: String(t.id),
        subject: t.subject ?? null,
        userId: Number(t.userId as any),
        userEmail: t.user?.email,
        assignedAdminId: t.assignedAdminId ?? null,
        assignedAdminEmail: t.assignedAdmin?.email ?? null,
        status: t.status as SupportStatus,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      }))
    } catch {
      // Fall back if query fails
    }
  }
  return [...memoryThreads].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function createThread(userEmail: string, payload: CreateThreadPayload): Promise<{ thread: SupportThreadDto; firstMessage: SupportMessageDto } | null> {
  const { subject, messageText, attachments } = payload
  if (isDbConfigured && prisma) {
    try {
      const user = await prisma.user.findUnique({ where: { email: userEmail } })
      if (!user) return null
      const thread = await prisma.supportThread.create({
        data: {
          userId: Number(user.id as any),
          subject: subject ?? null,
          status: 'Open',
        },
      })
      const msg = await prisma.supportMessage.create({
        data: {
          threadId: String(thread.id),
          userId: Number(user.id as any),
          messageText,
          attachments: attachments && attachments.length > 0 ? (attachments as any) : undefined,
        },
      })
      const dtoThread: SupportThreadDto = {
        id: String(thread.id),
        subject: thread.subject ?? null,
        userId: Number(thread.userId as any),
        userEmail: user.email,
        assignedAdminId: thread.assignedAdminId ?? null,
        assignedAdminEmail: null,
        status: thread.status as SupportStatus,
        createdAt: thread.createdAt.toISOString(),
        updatedAt: thread.updatedAt.toISOString(),
      }
      const dtoMsg: SupportMessageDto = {
        id: String(msg.id),
        threadId: String(thread.id),
        userId: Number(user.id as any),
        adminId: null,
        sender: 'User',
        messageText,
        attachments: (attachments && attachments.length > 0 ? attachments : undefined) ?? undefined,
        readByAdmin: false,
        readByUser: true,
        createdAt: msg.createdAt.toISOString(),
      }
      return { thread: dtoThread, firstMessage: dtoMsg }
    } catch {
      // fall back
    }
  }
  const id = `mem_${Math.random().toString(36).slice(2)}`
  const now = nowIso()
  const thread: SupportThreadDto = {
    id,
    subject: subject ?? null,
    userId: -1,
    userEmail,
    assignedAdminId: null,
    assignedAdminEmail: null,
    status: 'Open',
    createdAt: now,
    updatedAt: now,
  }
  const msg: SupportMessageDto = {
    id: `mem_msg_${Math.random().toString(36).slice(2)}`,
    threadId: id,
    userId: -1,
    adminId: null,
    sender: 'User',
    messageText,
    attachments: attachments && attachments.length > 0 ? attachments : undefined,
    readByAdmin: false,
    readByUser: true,
    createdAt: now,
  }
  memoryThreads.unshift(thread)
  memoryMessages.push(msg)
  return { thread, firstMessage: msg }
}

export async function listMessages(threadId: string): Promise<SupportMessageDto[]> {
  if (isDbConfigured && prisma) {
    try {
      const rows = await prisma.supportMessage.findMany({
        where: { threadId },
        orderBy: { createdAt: 'asc' },
      })
      return rows.map((m) => ({
        id: String(m.id),
        threadId: String(m.threadId),
        userId: m.userId ?? null,
        adminId: m.adminId ?? null,
        sender: m.adminId ? 'Admin' : 'User',
        messageText: m.messageText,
        attachments: (m.attachments as any) ?? null,
        readByAdmin: Boolean(m.readByAdmin),
        readByUser: Boolean(m.readByUser),
        createdAt: m.createdAt.toISOString(),
      }))
    } catch {
      // fall back
    }
  }
  return memoryMessages.filter((m) => m.threadId === threadId).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function postMessage(threadId: string, sender: { email: string; role: 'User' | 'Admin' | 'Staff' | 'SuperAdmin' | 'master_admin' }, payload: SendMessagePayload): Promise<SupportMessageDto | null> {
  const { messageText, attachments } = payload
  const isAdmin = sender.role === 'Admin' || sender.role === 'Staff' || sender.role === 'SuperAdmin' || sender.role === 'master_admin'
  if (isDbConfigured && prisma) {
    try {
      const thread = await prisma.supportThread.findUnique({ where: { id: threadId } })
      if (!thread) return null
      const author = isAdmin
        ? await prisma.user.findFirst({ where: { email: sender.email } })
        : await prisma.user.findUnique({ where: { email: sender.email } })
      const msg = await prisma.supportMessage.create({
        data: {
          threadId,
          messageText,
          attachments: attachments && attachments.length > 0 ? (attachments as any) : undefined,
          ...(author
            ? isAdmin
              ? { adminId: Number(author.id as any) }
              : { userId: Number(author.id as any) }
            : {}),
        },
      })
      // bump thread updatedAt
      await prisma.supportThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } })
      const dto: SupportMessageDto = {
        id: String(msg.id),
        threadId,
        userId: msg.userId ?? null,
        adminId: msg.adminId ?? null,
        sender: isAdmin ? 'Admin' : 'User',
        messageText,
        attachments: attachments && attachments.length > 0 ? attachments : undefined,
        readByAdmin: !isAdmin,
        readByUser: isAdmin,
        createdAt: msg.createdAt.toISOString(),
      }
      return dto
    } catch {
      // fall back
    }
  }
  const now = nowIso()
  const msg: SupportMessageDto = {
    id: `mem_msg_${Math.random().toString(36).slice(2)}`,
    threadId,
    userId: isAdmin ? null : -1,
    adminId: isAdmin ? -1 : null,
    sender: isAdmin ? 'Admin' : 'User',
    messageText,
    attachments: attachments && attachments.length > 0 ? attachments : undefined,
    readByAdmin: !isAdmin,
    readByUser: isAdmin,
    createdAt: now,
  }
  memoryMessages.push(msg)
  const tIdx = memoryThreads.findIndex((t) => t.id === threadId)
  if (tIdx >= 0) memoryThreads[tIdx].updatedAt = now
  return msg
}

export async function updateThread(threadId: string, update: { status?: SupportStatus; assignAdminEmail?: string | null }): Promise<SupportThreadDto | null> {
  if (isDbConfigured && prisma) {
    try {
      let assignedAdminId: number | null = null
      if (update.assignAdminEmail) {
        const admin = await prisma.user.findUnique({ where: { email: update.assignAdminEmail } })
        assignedAdminId = admin ? Number(admin.id as any) : null
      }
      const row = await prisma.supportThread.update({
        where: { id: threadId },
        data: {
          ...(update.status ? { status: update.status as any } : {}),
          assignedAdminId,
        },
        include: { user: true, assignedAdmin: true },
      })
      return {
        id: String(row.id),
        subject: row.subject ?? null,
        userId: Number(row.userId as any),
        userEmail: row.user?.email,
        assignedAdminId: row.assignedAdminId ?? null,
        assignedAdminEmail: row.assignedAdmin?.email ?? null,
        status: row.status as SupportStatus,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      }
    } catch {
      // fall back
    }
  }
  const idx = memoryThreads.findIndex((t) => t.id === threadId)
  if (idx < 0) return null
  const t = memoryThreads[idx]
  const updated: SupportThreadDto = {
    ...t,
    status: update.status ?? t.status,
    assignedAdminEmail: typeof update.assignAdminEmail === 'string' ? update.assignAdminEmail : t.assignedAdminEmail ?? null,
    updatedAt: nowIso(),
  }
  memoryThreads[idx] = updated
  return updated
}

export async function markMessageRead(messageId: string, by: 'user' | 'admin'): Promise<boolean> {
  if (isDbConfigured && prisma) {
    try {
      await prisma.supportMessage.update({
        where: { id: messageId },
        data: by === 'user' ? { readByUser: true } : { readByAdmin: true },
      })
      return true
    } catch {
      // fall back
    }
  }
  const idx = memoryMessages.findIndex((m) => m.id === messageId)
  if (idx < 0) return false
  const m = memoryMessages[idx]
  memoryMessages[idx] = { ...m, readByUser: by === 'user' ? true : m.readByUser, readByAdmin: by === 'admin' ? true : m.readByAdmin }
  return true
}


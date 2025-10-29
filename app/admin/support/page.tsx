"use client"
import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import type { SupportThreadDto, SupportMessageDto, SendMessagePayload, SupportStatus } from '@/lib/types'

const statuses: SupportStatus[] = ['Open', 'InProgress', 'Pending', 'Resolved', 'Urgent']

export default function SupportPage() {
  const { toast } = useToast()
  const [threads, setThreads] = useState<SupportThreadDto[]>([])
  const [loadingThreads, setLoadingThreads] = useState(false)
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<SupportMessageDto[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [reply, setReply] = useState('')
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState<SupportStatus | 'All'>('All')
  const [assignEmail, setAssignEmail] = useState('')
  const [lastThreadUpdated, setLastThreadUpdated] = useState<Record<string, string>>({})

  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      const matchQ = q.trim().length === 0 || (t.subject || '').toLowerCase().includes(q.toLowerCase()) || (t.userEmail || '').toLowerCase().includes(q.toLowerCase())
      const matchStatus = statusFilter === 'All' || t.status === statusFilter
      return matchQ && matchStatus
    })
  }, [threads, q, statusFilter])

  const selectedThread = useMemo(() => threads.find((t) => t.id === selectedThreadId) || null, [threads, selectedThreadId])

  const fetchThreads = async () => {
    setLoadingThreads(true)
    try {
      const res = await fetch('/api/support/threads', { cache: 'no-store' })
      const data = await res.json()
      if (data.ok) {
        const nextThreads = data.threads as SupportThreadDto[]
        // Notify on new updates
        nextThreads.forEach((t: SupportThreadDto) => {
          const prev = lastThreadUpdated[t.id]
          if (prev && new Date(t.updatedAt).getTime() > new Date(prev).getTime()) {
            toast({ title: 'New message', description: `${t.userEmail || 'User'} updated: ${t.subject || 'No subject'}` })
          }
        })
        setThreads(nextThreads)
        setLastThreadUpdated(Object.fromEntries(nextThreads.map((t: SupportThreadDto) => [t.id, t.updatedAt])))
      }
      else toast({ title: 'Failed to load', description: data.error || 'Unable to load support threads', variant: 'destructive' })
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || String(e), variant: 'destructive' })
    } finally {
      setLoadingThreads(false)
    }
  }

  const fetchMessages = async (threadId: string) => {
    setLoadingMessages(true)
    try {
      const res = await fetch(`/api/support/threads/${threadId}/messages`, { cache: 'no-store' })
      const data = await res.json()
      if (data.ok) setMessages(data.messages as SupportMessageDto[])
      else toast({ title: 'Failed to load', description: data.error || 'Unable to load messages', variant: 'destructive' })
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || String(e), variant: 'destructive' })
    } finally {
      setLoadingMessages(false)
    }
  }

  useEffect(() => {
    fetchThreads()
  }, [])

  useEffect(() => {
    if (selectedThreadId) fetchMessages(selectedThreadId)
  }, [selectedThreadId])

  // Near real-time updates: poll threads and current messages
  useEffect(() => {
    const id = setInterval(() => {
      fetchThreads()
      if (selectedThreadId) fetchMessages(selectedThreadId)
    }, 5000)
    return () => clearInterval(id)
  }, [selectedThreadId])

  const handleSend = async () => {
    if (!selectedThreadId) return
    const text = reply.trim()
    if (!text) return
    try {
      const res = await fetch(`/api/support/threads/${selectedThreadId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageText: text } satisfies Partial<SendMessagePayload>),
      })
      const data = await res.json()
      if (data.ok) {
        setReply('')
        await fetchMessages(selectedThreadId)
        await fetchThreads()
        toast({ title: 'Reply sent', description: 'Message delivered to user.' })
      } else {
        toast({ title: 'Failed to send reply', description: data.error || 'Unable to send', variant: 'destructive' })
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || String(e), variant: 'destructive' })
    }
  }

  const updateStatus = async (threadId: string, next: SupportStatus) => {
    try {
      const res = await fetch(`/api/support/threads/${threadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      const data = await res.json()
      if (data.ok) {
        await fetchThreads()
        toast({ title: 'Status updated', description: `Marked as ${next}.` })
      } else {
        toast({ title: 'Failed to update', description: data.error || 'Unable to update status', variant: 'destructive' })
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || String(e), variant: 'destructive' })
    }
  }

  const assignAdmin = async (threadId: string) => {
    const email = assignEmail.trim()
    if (!email) return
    try {
      const res = await fetch(`/api/support/threads/${threadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignAdminEmail: email })
      })
      const data = await res.json()
      if (data.ok) {
        setAssignEmail('')
        await fetchThreads()
        toast({ title: 'Assigned', description: `Assigned to ${email}.` })
      } else {
        toast({ title: 'Failed to assign', description: data.error || 'Unable to assign admin', variant: 'destructive' })
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || String(e), variant: 'destructive' })
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Help & Support</CardTitle>
          <CardDescription>Manage user requests and reply.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input value={q} onChange={(e) => setQ(e.target.value)} className="flex-1 rounded-md border px-3 py-2" placeholder="Search by subject or user email" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="rounded-md border px-2 py-2 text-sm">
                <option value="All">All</option>
                {statuses.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div className="space-y-2 max-h-[50vh] overflow-auto">
              {loadingThreads && <div className="text-sm text-muted-foreground">Loading…</div>}
              {!loadingThreads && filteredThreads.length === 0 && <div className="text-sm text-muted-foreground">No conversations.</div>}
              {filteredThreads.map((t) => (
                <div key={t.id} className={`p-2 rounded-md border cursor-pointer ${selectedThreadId === t.id ? 'border-primary' : 'hover:bg-muted'}`} onClick={() => setSelectedThreadId(t.id)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{t.subject || 'No subject'}</div>
                      <div className="text-xs text-muted-foreground">{t.userEmail || '—'}</div>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(t.updatedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-xs text-muted-foreground">Status: {t.status}</div>
                    <div className="text-xs text-muted-foreground">Assigned: {t.assignedAdminEmail || '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
          <CardDescription>{selectedThread ? selectedThread.subject || 'No subject' : 'Select a conversation'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col h-[60vh]">
            <div className="flex-1 overflow-auto space-y-3 border rounded-md p-3">
              {loadingMessages && <div className="text-sm text-muted-foreground">Loading…</div>}
              {!loadingMessages && messages.length === 0 && <div className="text-sm text-muted-foreground">No messages yet.</div>}
              {messages.map((m) => (
                <div key={m.id} className={`max-w-[75%] p-2 rounded-md ${m.sender === 'User' ? 'bg-primary/10 self-start' : 'bg-secondary/10 self-end'}`}>
                  <div className="text-xs text-muted-foreground mb-1">{m.sender} • {new Date(m.createdAt).toLocaleString()}</div>
                  <div className="text-sm whitespace-pre-wrap">{m.messageText}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input value={reply} onChange={(e) => setReply(e.target.value)} className="flex-1 rounded-md border px-3 py-2" placeholder="Type a reply…" />
              <button onClick={handleSend} disabled={!selectedThreadId || !reply.trim()} className="inline-flex items-center rounded-md bg-primary text-white px-4 py-2 disabled:opacity-50">Send</button>
            </div>
            {selectedThread && (
              <div className="mt-3 flex items-center gap-2">
                <label className="text-sm">Status:</label>
                <select value={selectedThread.status} onChange={(e) => updateStatus(selectedThread.id, e.target.value as SupportStatus)} className="rounded-md border px-2 py-2 text-sm">
                  {statuses.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
                <label className="text-sm ml-4">Assign admin:</label>
                <input value={assignEmail} onChange={(e) => setAssignEmail(e.target.value)} className="rounded-md border px-2 py-2 text-sm" placeholder="admin@example.com" />
                <button onClick={() => assignAdmin(selectedThread.id)} disabled={!assignEmail.trim()} className="inline-flex items-center rounded-md border px-3 py-2 text-sm">Assign</button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

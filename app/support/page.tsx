"use client"
import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import type { SupportThreadDto, SupportMessageDto, CreateThreadPayload, SendMessagePayload, SupportStatus } from '@/lib/types'

export default function UserSupportPage() {
  const { toast } = useToast()
  const [threads, setThreads] = useState<SupportThreadDto[]>([])
  const [loadingThreads, setLoadingThreads] = useState(false)
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<SupportMessageDto[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [creating, setCreating] = useState(false)
  const [newSubject, setNewSubject] = useState('')
  const [newBody, setNewBody] = useState('')

  const selectedThread = useMemo(() => threads.find((t) => t.id === selectedThreadId) || null, [threads, selectedThreadId])

  const fetchThreads = async () => {
    setLoadingThreads(true)
    try {
      const res = await fetch('/api/support/threads', { cache: 'no-store' })
      const data = await res.json()
      if (data.ok) setThreads(data.threads as SupportThreadDto[])
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
    const text = newMessage.trim()
    if (!text) return
    try {
      const res = await fetch(`/api/support/threads/${selectedThreadId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageText: text } satisfies Partial<SendMessagePayload>),
      })
      const data = await res.json()
      if (data.ok) {
        setNewMessage('')
        await fetchMessages(selectedThreadId)
        toast({ title: 'Message sent', description: 'Your message has been sent.' })
      } else {
        toast({ title: 'Failed to send message', description: data.error || 'Unable to send', variant: 'destructive' })
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || String(e), variant: 'destructive' })
    }
  }

  const handleCreateThread = async () => {
    const text = newBody.trim()
    if (!text) return
    setCreating(true)
    try {
      const res = await fetch('/api/support/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: newSubject.trim() || undefined, messageText: text } satisfies Partial<CreateThreadPayload>),
      })
      const data = await res.json()
      if (data.ok) {
        setNewSubject('')
        setNewBody('')
        await fetchThreads()
        setSelectedThreadId(data.thread.id)
        toast({ title: 'Request submitted', description: 'Support request created.' })
      } else {
        toast({ title: 'Failed to submit', description: data.error || 'Unable to create support request', variant: 'destructive' })
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || String(e), variant: 'destructive' })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Help & Support</CardTitle>
          <CardDescription>Submit requests and view conversations.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium">Subject (optional)</label>
              <input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" placeholder="Brief subject" />
            </div>
            <div>
              <label className="block text-sm font-medium">Message</label>
              <textarea value={newBody} onChange={(e) => setNewBody(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 h-24" placeholder="Describe your issue" />
            </div>
            <button onClick={handleCreateThread} disabled={creating || !newBody.trim()} className="inline-flex items-center rounded-md bg-primary text-white px-4 py-2 disabled:opacity-50">
              {creating ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
          <hr className="my-4" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Your Conversations</h3>
              <button onClick={fetchThreads} className="text-xs text-muted-foreground">Refresh</button>
            </div>
            <div className="space-y-2 max-h-[40vh] overflow-auto">
              {loadingThreads && <div className="text-sm text-muted-foreground">Loading…</div>}
              {!loadingThreads && threads.length === 0 && <div className="text-sm text-muted-foreground">No conversations yet.</div>}
              {threads.map((t) => (
                <div key={t.id} className={`p-2 rounded-md border cursor-pointer ${selectedThreadId === t.id ? 'border-primary' : 'hover:bg-muted'}`} onClick={() => setSelectedThreadId(t.id)}>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{t.subject || 'No subject'}</div>
                    <span className="text-xs text-muted-foreground">{new Date(t.updatedAt).toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Status: {t.status}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
          <CardDescription>{selectedThread ? selectedThread.subject || 'No subject' : 'Select a conversation to view messages'}</CardDescription>
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
              <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1 rounded-md border px-3 py-2" placeholder="Type your message…" />
              <button onClick={handleSend} disabled={!selectedThreadId || !newMessage.trim()} className="inline-flex items-center rounded-md bg-primary text-white px-4 py-2 disabled:opacity-50">Send</button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client";

import { useEffect, useMemo, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { SupportThreadDto, SupportMessageDto } from '@/lib/types'

type Thread = SupportThreadDto
type Message = SupportMessageDto

export default function SupportPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [typingFrom, setTypingFrom] = useState<string | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const [showNewThread, setShowNewThread] = useState(false)
  const [newSubject, setNewSubject] = useState('')
  const [newMessage, setNewMessage] = useState('')

  const activeThread = useMemo(() => threads.find(t => t.id === activeThreadId) || null, [threads, activeThreadId])

  // Load threads at mount
  useEffect(() => {
    (async () => {
      const res = await fetch('/api/support/threads', { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.ok) {
        setThreads(data.threads || [])
        if (data.threads?.[0]?.id) setActiveThreadId(data.threads[0].id)
      }
    })()
  }, [])

  // Connect socket
  useEffect(() => {
    const s = io(process.env.NEXT_PUBLIC_CHAT_SERVER_URL || 'http://localhost:4000', { withCredentials: true })
    setSocket(s)
    s.on('support:message', ({ message }: { message: Message }) => {
      setMessages((prev) => [...prev, message])
      setTypingFrom(null)
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
    })
    s.on('support:typing', ({ by }: { threadId: string; by: string }) => setTypingFrom(by))
    return () => { s.disconnect() }
  }, [])

  // Load messages when switching thread and join socket room
  useEffect(() => {
    (async () => {
      if (!activeThreadId) return
      try {
        const res = await fetch(`/api/support/threads/${activeThreadId}/messages`, { cache: 'no-store' })
        const data = await res.json().catch(() => ({}))
        if (res.ok && data?.ok) {
          setMessages(data.messages || [])
          if (socket) socket.emit('support:join_thread', activeThreadId)
          // scroll to bottom
          setTimeout(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight }, 0)
        }
      } catch {}
    })()
  }, [activeThreadId, socket])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || !activeThreadId) return
    try {
      // Send via socket for real-time
      socket?.emit('support:send_message', { threadId: activeThreadId, messageText: text })
      // Optimistic UI echo
      const optimistic: Message = {
        id: `tmp_${Math.random().toString(36).slice(2)}`,
        threadId: activeThreadId,
        sender: 'User',
        messageText: text,
        attachments: null,
        readByAdmin: false,
        readByUser: true,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, optimistic] as Message[])
      setInput('')
      setTimeout(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight }, 0)
      // Also persist via API as a fallback
      await fetch(`/api/support/threads/${activeThreadId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageText: text }) })
    } catch {}
  }

  const createThread = async () => {
    const subject = newSubject.trim() || undefined
    const messageText = newMessage.trim()
    if (!messageText) return
    const res = await fetch('/api/support/threads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject, messageText }) })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data?.ok && data.thread?.id) {
      setThreads((prev) => [data.thread as Thread, ...prev])
      setActiveThreadId(data.thread.id)
      setMessages([data.firstMessage as Message].filter(Boolean))
      setShowNewThread(false)
      setNewSubject('')
      setNewMessage('')
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Help & Support</CardTitle>
          <CardDescription>Live support chat with typing indicators and message history.</CardDescription>
        </div>
        <Button onClick={() => setShowNewThread((v) => !v)} variant="outline">{showNewThread ? 'Close' : 'New Chat'}</Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <aside className="md:col-span-1 border rounded-lg overflow-hidden">
            <div className="p-3 text-sm font-medium bg-muted/50 flex items-center justify-between">
              <span>Threads</span>
            </div>
            {showNewThread && (
              <div className="p-3 border-b space-y-2">
                <Input placeholder="Subject (optional)" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} />
                <Input placeholder="Initial message" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                <div className="flex gap-2">
                  <Button onClick={createThread} disabled={!newMessage.trim()}>Create</Button>
                  <Button variant="secondary" onClick={() => { setShowNewThread(false); setNewSubject(''); setNewMessage(''); }}>Cancel</Button>
                </div>
              </div>
            )}
            <div className="max-h-[50vh] overflow-auto">
              {threads.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveThreadId(t.id)}
                  className={`w-full text-left p-3 border-b hover:bg-muted/40 ${activeThreadId === t.id ? 'bg-muted/30' : ''}`}
                >
                  <div className="font-medium truncate">{t.subject || 'No Subject'}</div>
                  <div className="text-xs text-muted-foreground">{t.status} • {new Date(t.updatedAt).toLocaleString()}</div>
                </button>
              ))}
            </div>
          </aside>
          <section className="md:col-span-2 border rounded-lg flex flex-col overflow-hidden">
            <div className="p-3 text-sm bg-muted/50 flex items-center justify-between">
              <div>
                <div className="font-medium">{activeThread?.subject || 'Select a thread'}</div>
                <div className="text-xs text-muted-foreground">{activeThread ? `Status: ${activeThread.status}` : '—'}</div>
              </div>
              <AnimatePresence>
                {typingFrom && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    className="text-xs text-muted-foreground"
                  >
                    {typingFrom} is typing…
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div ref={listRef} className="flex-1 overflow-auto p-4 space-y-2 bg-background">
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={`max-w-[75%] p-3 rounded-xl shadow-sm ${m.sender === 'Admin' ? 'bg-emerald-100 dark:bg-emerald-900 ml-auto' : 'bg-muted/40'} `}
                  >
                    <div className="text-xs text-muted-foreground mb-1">{m.sender}</div>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.messageText}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">{new Date(m.createdAt).toLocaleTimeString()}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="p-3 border-t flex items-center gap-2">
              <Input
                placeholder={activeThreadId ? 'Type a message…' : 'Select or create a thread'}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  if (activeThreadId && socket) socket.emit('support:typing', activeThreadId)
                }}
                disabled={!activeThreadId}
              />
              <Button onClick={sendMessage} disabled={!activeThreadId || !input.trim()}>Send</Button>
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  )
}

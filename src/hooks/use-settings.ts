"use client";
import { useEffect, useState } from 'react'
import type { PublicSettings } from '@/lib/types'

export function useSettings() {
  const [settings, setSettings] = useState<PublicSettings | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load settings')
        const json: PublicSettings = await res.json()
        if (mounted) setSettings(json)
      } catch (e: any) {
        if (mounted) setError(e?.message || String(e))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return { settings, loading, error }
}

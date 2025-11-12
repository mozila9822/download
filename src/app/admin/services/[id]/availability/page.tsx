"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";

type Day = { date: string; blocked: boolean; capacity: number; booked: number; priceOverride: number | null }

function ymOf(dateStr: string) {
  const [y,m] = dateStr.split("-")
  return `${y}-${m}`
}

export default function ServiceAvailabilityPage({ params }: { params: { id: string } }) {
  const [month, setMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
  })
  const [days, setDays] = useState<Day[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/admin/services/${params.id}/availability?month=${encodeURIComponent(month)}`, { cache: 'no-store' })
        const json = await res.json()
        if (!cancelled && json?.ok) setDays(json.days || [])
        else if (!cancelled) setDays([])
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [params.id, month])

  const totalDays = useMemo(() => days.length, [days])
  const prevMonth = () => {
    const [y,m] = month.split('-').map(Number)
    const d = new Date(y, m-1, 1)
    d.setMonth(d.getMonth()-1)
    setMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`)
  }
  const nextMonth = () => {
    const [y,m] = month.split('-').map(Number)
    const d = new Date(y, m-1, 1)
    d.setMonth(d.getMonth()+1)
    setMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`)
  }

  const toggleBlock = (idx: number) => {
    setDays((ds) => {
      const next = [...ds]
      next[idx] = { ...next[idx], blocked: !next[idx].blocked }
      return next
    })
  }
  const setCapacity = (idx: number, v: number) => {
    setDays((ds) => { const next = [...ds]; next[idx] = { ...next[idx], capacity: v }; return next })
  }
  const setOverride = (idx: number, v: number | null) => {
    setDays((ds) => { const next = [...ds]; next[idx] = { ...next[idx], priceOverride: v }; return next })
  }

  const save = async () => {
    try {
      setSaving(true)
      const res = await fetch(`/api/admin/services/${params.id}/availability`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: days.map(d => ({ date: d.date, blocked: d.blocked, capacity: d.capacity, priceOverride: d.priceOverride })) }) })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.ok) throw new Error(json?.error || 'Failed to save')
    } catch (e: any) {
      setError(e?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={prevMonth}>Prev</Button>
            <div className="text-sm">{month}</div>
            <Button variant="outline" onClick={nextMonth}>Next</Button>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
        {loading ? (
          <div className="text-sm">Loading…</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {days.map((d, idx) => (
              <div key={d.date} className={`rounded-md border p-2 ${d.blocked ? 'bg-red-50' : 'bg-muted/20'}`}>
                <div className="text-xs font-medium">{d.date.split('-')[2]}</div>
                <div className="mt-1 flex items-center gap-2">
                  <Button size="sm" variant={d.blocked ? 'destructive' : 'outline'} onClick={() => toggleBlock(idx)}>{d.blocked ? 'Blocked' : 'Open'}</Button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs">Cap</span>
                  <Input value={String(d.capacity)} onChange={(e) => setCapacity(idx, Number(e.target.value || 0))} />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs">Override</span>
                  <Input value={d.priceOverride == null ? '' : String(d.priceOverride)} onChange={(e) => setOverride(idx, e.target.value === '' ? null : Number(e.target.value))} />
                </div>
              </div>
            ))}
          </div>
        )}
        {error && <div className="mt-4 text-sm text-destructive">{error}</div>}
      </CardContent>
    </Card>
  )
}


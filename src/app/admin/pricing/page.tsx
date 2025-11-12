"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Table, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, Search } from 'lucide-react'

type Rule = {
  id: string
  serviceId?: string | null
  category?: string | null
  name: string
  active: boolean
  startDate?: string | null
  endDate?: string | null
  weekendOnly: boolean
  multiplier?: number | null
  fixedOverride?: number | null
  priority: number
}

const categories = ['CityBreak', 'Hotel', 'Tour', 'Flight', 'CoachRide']

export default function PricingRulesAdminPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [rows, setRows] = useState<Rule[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<any>(null)
  const [serviceId, setServiceId] = useState<string>(() => searchParams.get('serviceId') || '')
  const [category, setCategory] = useState<string>(() => searchParams.get('category') || 'all')
  const [activeOnly, setActiveOnly] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState('')

  const loadRows = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (serviceId.trim()) params.set('serviceId', serviceId.trim())
      if (category.trim() && category !== 'all') params.set('category', category.trim())
      if (activeOnly) params.set('active', 'true')
      const res = await fetch(`/api/admin/pricing-rules?${params.toString()}`, { cache: 'no-store' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.ok) throw new Error(json?.error || res.statusText)
      setRows(json.rules || [])
    } catch (e: any) {
      setError(e)
    } finally {
      setIsLoading(false)
    }
  }, [serviceId, category, activeOnly])

  useEffect(() => { loadRows() }, [loadRows])

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editItem, setEditItem] = useState<Rule | null>(null)

  const [form, setForm] = useState<Rule>({ id: '', serviceId: '', category: '', name: '', active: true, startDate: null, endDate: null, weekendOnly: false, multiplier: null, fixedOverride: null, priority: 10 })

  const resetForm = () => setForm({ id: '', serviceId: serviceId || '', category: category || '', name: '', active: true, startDate: null, endDate: null, weekendOnly: false, multiplier: null, fixedOverride: null, priority: 10 })
  const openAdd = () => { resetForm(); setIsAddOpen(true) }
  const openEdit = (r: Rule) => { setEditItem(r); setForm({ ...r }); setIsEditOpen(true) }
  const closeAdd = () => setIsAddOpen(false)
  const closeEdit = () => { setIsEditOpen(false); setEditItem(null) }

  const createRule = async () => {
    try {
      const payload: any = { ...form }
      delete payload.id
      const res = await fetch('/api/admin/pricing-rules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.ok) throw new Error(json?.error || res.statusText)
      toast({ title: 'Added', description: 'Pricing rule created.' })
      await loadRows()
      closeAdd()
      resetForm()
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Add failed', description: e?.message || String(e) })
    }
  }

  const updateRule = async () => {
    if (!editItem) return
    try {
      const payload: any = { ...form }
      delete payload.id
      const res = await fetch(`/api/admin/pricing-rules/${encodeURIComponent(editItem.id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.ok) throw new Error(json?.error || res.statusText)
      toast({ title: 'Updated', description: 'Pricing rule updated.' })
      await loadRows()
      closeEdit()
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Update failed', description: e?.message || String(e) })
    }
  }

  const deleteRule = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/pricing-rules/${encodeURIComponent(id)}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.ok) throw new Error(json?.error || res.statusText)
      toast({ title: 'Deleted', description: 'Pricing rule removed.' })
      await loadRows()
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Delete failed', description: e?.message || String(e) })
    }
  }

  const filtered = useMemo(() => {
    let list = rows
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase()
      list = list.filter((r) => r.name.toLowerCase().includes(q))
    }
    return list
  }, [rows, searchTerm])

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Pricing Rules</CardTitle>
          <CardDescription>Seasonal windows, weekend multipliers, and overrides.</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button onClick={openAdd} className="rounded-lg"><Plus className="h-4 w-4 mr-2" /> Add Rule</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-3">
          <Input placeholder="Filter by serviceId" value={serviceId} onChange={(e) => setServiceId(e.target.value)} />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Label>Active Only</Label>
            <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} />
          </div>
          <div className="relative">
            <Input placeholder="Search by name" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-center"><Button variant="outline" onClick={loadRows}>Refresh</Button></div>
        </div>

        <div className="mb-6 p-4 rounded-lg border">
          <div className="text-sm font-medium mb-3">Presets</div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              disabled={!serviceId && category === 'all'}
              onClick={async () => {
                const payload: any = {
                  name: 'Peak Season 1.20×',
                  active: true,
                  weekendOnly: false,
                  multiplier: 1.2,
                  fixedOverride: null,
                  priority: 20,
                }
                if (serviceId) payload.serviceId = serviceId
                if (category && category !== 'all') payload.category = category
                const res = await fetch('/api/admin/pricing-rules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                const json = await res.json().catch(() => null)
                if (res.ok && json?.ok) { await loadRows() } else { toast({ variant: 'destructive', title: 'Failed', description: json?.error || 'Unable to add preset' }) }
              }}
            >Peak Season 1.20×</Button>

            <Button
              variant="secondary"
              disabled={!serviceId && category === 'all'}
              onClick={async () => {
                const payload: any = {
                  name: 'Weekend 1.10×',
                  active: true,
                  weekendOnly: true,
                  multiplier: 1.1,
                  fixedOverride: null,
                  priority: 15,
                }
                if (serviceId) payload.serviceId = serviceId
                if (category && category !== 'all') payload.category = category
                const res = await fetch('/api/admin/pricing-rules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                const json = await res.json().catch(() => null)
                if (res.ok && json?.ok) { await loadRows() } else { toast({ variant: 'destructive', title: 'Failed', description: json?.error || 'Unable to add preset' }) }
              }}
            >Weekend 1.10×</Button>

            <Button
              variant="secondary"
              disabled={!serviceId && category === 'all'}
              onClick={async () => {
                const payload: any = {
                  name: 'Fixed £299',
                  active: true,
                  weekendOnly: false,
                  fixedOverride: 299,
                  multiplier: null,
                  priority: 25,
                }
                if (serviceId) payload.serviceId = serviceId
                if (category && category !== 'all') payload.category = category
                const res = await fetch('/api/admin/pricing-rules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                const json = await res.json().catch(() => null)
                if (res.ok && json?.ok) { await loadRows() } else { toast({ variant: 'destructive', title: 'Failed', description: json?.error || 'Unable to add preset' }) }
              }}
            >Fixed £299</Button>

            <Button
              variant="secondary"
              disabled={!serviceId && category === 'all'}
              onClick={async () => {
                const payload: any = {
                  name: 'Off-Peak 0.85×',
                  active: true,
                  weekendOnly: false,
                  multiplier: 0.85,
                  fixedOverride: null,
                  priority: 10,
                }
                if (serviceId) payload.serviceId = serviceId
                if (category && category !== 'all') payload.category = category
                const res = await fetch('/api/admin/pricing-rules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                const json = await res.json().catch(() => null)
                if (res.ok && json?.ok) { await loadRows() } else { toast({ variant: 'destructive', title: 'Failed', description: json?.error || 'Unable to add preset' }) }
              }}
            >Off-Peak 0.85×</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="font-medium">Name</TableCell>
                <TableCell className="font-medium">Scope</TableCell>
                <TableCell className="font-medium">Dates</TableCell>
                <TableCell className="font-medium">Weekend</TableCell>
                <TableCell className="font-medium">Multiplier</TableCell>
                <TableCell className="font-medium">Override</TableCell>
                <TableCell className="font-medium">Priority</TableCell>
                <TableCell className="font-medium">Active</TableCell>
                <TableCell className="font-medium">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={9}>Loading...</TableCell></TableRow>}
              {!!error && <TableRow><TableCell colSpan={9} className="text-red-600">Error: {String(error.message || error)}</TableCell></TableRow>}
              {!isLoading && !error && filtered.length === 0 && <TableRow><TableCell colSpan={9}>No rules found.</TableCell></TableRow>}
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{r.serviceId ? `Service ${r.serviceId}` : (r.category || '-')}</TableCell>
                  <TableCell>{r.startDate ? `${String(r.startDate).split('T')[0]} → ${String(r.endDate || '').split('T')[0]}` : '—'}</TableCell>
                  <TableCell>{r.weekendOnly ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{r.multiplier != null ? String(r.multiplier) : '—'}</TableCell>
                  <TableCell>{r.fixedOverride != null ? `£${Number(r.fixedOverride).toFixed(2)}` : '—'}</TableCell>
                  <TableCell>{r.priority}</TableCell>
                  <TableCell>{r.active ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(r)} className="rounded-md"><Edit className="h-4 w-4 mr-1" /> Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteRule(r.id)} className="rounded-md"><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Pricing Rule</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Active</Label><input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} /></div>
            <div><Label>Service ID</Label><Input value={form.serviceId ?? ''} onChange={(e) => setForm((f) => ({ ...f, serviceId: e.target.value }))} /></div>
            <div>
              <Label>Category</Label>
              <Select value={form.category ?? 'none'} onValueChange={(v) => setForm((f) => ({ ...f, category: v === 'none' ? null : v }))}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Start Date</Label><Input type="date" value={form.startDate ? String(form.startDate).substring(0,10) : ''} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value ? `${e.target.value}T00:00:00` : null }))} /></div>
            <div><Label>End Date</Label><Input type="date" value={form.endDate ? String(form.endDate).substring(0,10) : ''} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value ? `${e.target.value}T00:00:00` : null }))} /></div>
            <div><Label>Weekend Only</Label><input type="checkbox" checked={form.weekendOnly} onChange={(e) => setForm((f) => ({ ...f, weekendOnly: e.target.checked }))} /></div>
            <div><Label>Multiplier</Label><Input type="number" step="0.01" value={form.multiplier ?? ''} onChange={(e) => setForm((f) => ({ ...f, multiplier: e.target.value === '' ? null : Number(e.target.value) }))} /></div>
            <div><Label>Fixed Override</Label><Input type="number" step="0.01" value={form.fixedOverride ?? ''} onChange={(e) => setForm((f) => ({ ...f, fixedOverride: e.target.value === '' ? null : Number(e.target.value) }))} /></div>
            <div><Label>Priority</Label><Input type="number" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: Number(e.target.value || 10) }))} /></div>
            <div className="md:col-span-2"><Button variant="outline" onClick={closeAdd}>Cancel</Button> <Button onClick={createRule}>Save</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Pricing Rule</DialogTitle></DialogHeader>
          {editItem && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
              <div><Label>Active</Label><input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} /></div>
              <div><Label>Service ID</Label><Input value={form.serviceId ?? ''} onChange={(e) => setForm((f) => ({ ...f, serviceId: e.target.value }))} /></div>
              <div>
                <Label>Category</Label>
                <Select value={form.category ?? 'none'} onValueChange={(v) => setForm((f) => ({ ...f, category: v === 'none' ? null : v }))}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Start Date</Label><Input type="date" value={form.startDate ? String(form.startDate).substring(0,10) : ''} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value ? `${e.target.value}T00:00:00` : null }))} /></div>
              <div><Label>End Date</Label><Input type="date" value={form.endDate ? String(form.endDate).substring(0,10) : ''} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value ? `${e.target.value}T00:00:00` : null }))} /></div>
              <div><Label>Weekend Only</Label><input type="checkbox" checked={form.weekendOnly} onChange={(e) => setForm((f) => ({ ...f, weekendOnly: e.target.checked }))} /></div>
              <div><Label>Multiplier</Label><Input type="number" step="0.01" value={form.multiplier ?? ''} onChange={(e) => setForm((f) => ({ ...f, multiplier: e.target.value === '' ? null : Number(e.target.value) }))} /></div>
              <div><Label>Fixed Override</Label><Input type="number" step="0.01" value={form.fixedOverride ?? ''} onChange={(e) => setForm((f) => ({ ...f, fixedOverride: e.target.value === '' ? null : Number(e.target.value) }))} /></div>
              <div><Label>Priority</Label><Input type="number" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: Number(e.target.value || 10) }))} /></div>
              <div className="md:col-span-2"><Button variant="outline" onClick={closeEdit}>Cancel</Button> <Button onClick={updateRule}>Save changes</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}

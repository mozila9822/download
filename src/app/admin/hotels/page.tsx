"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Table, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, Search } from 'lucide-react'

type ServiceDto = {
  id: string
  category: string
  title: string
  description: string
  price: number
  offerPrice?: number
  location: string
  imageUrl: string
  status: 'Active' | 'Inactive' | 'Archived'
  available: boolean
  startDate?: string
  endDate?: string
  isOffer: boolean
}

export default function HotelsAdminPage() {
  const { toast } = useToast()
  const [rows, setRows] = useState<ServiceDto[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Archived'>('All')
  const [offerOnly, setOfferOnly] = useState<boolean>(false)

  const loadRows = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('category', 'Hotel')
      if (offerOnly) params.set('offerOnly', 'true')
      if (statusFilter !== 'All') params.set('status', statusFilter)
      if (searchTerm.trim()) params.set('q', searchTerm.trim())
      const res = await fetch(`/api/admin/services?${params.toString()}`, { cache: 'no-store' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.ok) throw new Error(json?.error || res.statusText)
      setRows(json.services || [])
    } catch (e: any) {
      setError(e)
    } finally {
      setIsLoading(false)
    }
  }, [offerOnly, statusFilter, searchTerm])

  useEffect(() => { loadRows() }, [loadRows])

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editItem, setEditItem] = useState<ServiceDto | null>(null)

  const [form, setForm] = useState<{
    title: string
    description: string
    price: number
    offerPrice?: number
    location: string
    imageUrl: string
    status: 'Active' | 'Inactive' | 'Archived'
    available: boolean
    startDate?: string
    endDate?: string
    isOffer: boolean
  }>({ title: '', description: '', price: 0, offerPrice: undefined, location: '', imageUrl: '', status: 'Active', available: true, isOffer: false })

  const resetForm = () => setForm({ title: '', description: '', price: 0, offerPrice: undefined, location: '', imageUrl: '', status: 'Active', available: true, isOffer: false })
  const openAdd = () => { resetForm(); setIsAddOpen(true) }
  const openEdit = (s: ServiceDto) => { setEditItem(s); setForm({ title: s.title, description: s.description, price: s.price, offerPrice: s.offerPrice, location: s.location, imageUrl: s.imageUrl, status: s.status, available: s.available, startDate: s.startDate, endDate: s.endDate, isOffer: s.isOffer }) ; setIsEditOpen(true) }
  const closeAdd = () => setIsAddOpen(false)
  const closeEdit = () => { setIsEditOpen(false); setEditItem(null) }

  const createService = async () => {
    try {
      const payload = { category: 'Hotel', ...form }
      const res = await fetch('/api/admin/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.ok) throw new Error(json?.error || res.statusText)
      toast({ title: 'Added', description: `Hotel created.` })
      await loadRows()
      closeAdd()
      resetForm()
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Add failed', description: e?.message || String(e) })
    }
  }

  const updateService = async () => {
    if (!editItem) return
    try {
      const payload: any = { ...form, category: 'Hotel' }
      const res = await fetch(`/api/admin/services/${encodeURIComponent(editItem.id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.ok) throw new Error(json?.error || res.statusText)
      toast({ title: 'Updated', description: `Hotel updated.` })
      await loadRows()
      closeEdit()
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Update failed', description: e?.message || String(e) })
    }
  }

  const deleteService = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/services/${encodeURIComponent(id)}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.ok) throw new Error(json?.error || res.statusText)
      toast({ title: 'Deleted', description: `Hotel removed.` })
      await loadRows()
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Delete failed', description: e?.message || String(e) })
    }
  }

  const filtered = useMemo(() => {
    let list = rows
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase()
      list = list.filter((s) => s.title.toLowerCase().includes(q) || s.location.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
    }
    if (statusFilter !== 'All') list = list.filter((s) => s.status === statusFilter)
    if (offerOnly) list = list.filter((s) => s.offerPrice != null)
    return list
  }, [rows, searchTerm, statusFilter, offerOnly])

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Hotels</CardTitle>
          <CardDescription>Manage accommodation listings, availability and offers.</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button onClick={openAdd} className="rounded-lg"><Plus className="h-4 w-4 mr-2" /> Add Hotel</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Input placeholder="Search title or location" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Label>Offers Only</Label>
            <input type="checkbox" checked={offerOnly} onChange={(e) => setOfferOnly(e.target.checked)} />
          </div>
          <div className="flex items-center"><Button variant="outline" onClick={loadRows}>Refresh</Button></div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="font-medium">Image</TableCell>
                <TableCell className="font-medium">Title</TableCell>
                <TableCell className="font-medium">Location</TableCell>
                <TableCell className="font-medium">Price</TableCell>
                <TableCell className="font-medium">Offer</TableCell>
                <TableCell className="font-medium">Status</TableCell>
                <TableCell className="font-medium">Available</TableCell>
                <TableCell className="font-medium">Dates</TableCell>
                <TableCell className="font-medium">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={9}>Loading...</TableCell></TableRow>}
              {!!error && <TableRow><TableCell colSpan={9} className="text-red-600">Error: {String(error.message || error)}</TableCell></TableRow>}
              {!isLoading && !error && filtered.length === 0 && <TableRow><TableCell colSpan={9}>No hotels found.</TableCell></TableRow>}
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.imageUrl ? (<img src={s.imageUrl} alt={s.title} className="h-16 w-24 object-cover rounded-md border" />) : (<div className="h-16 w-24 bg-muted rounded-md grid place-items-center text-xs text-muted-foreground">No Image</div>)}</TableCell>
                  <TableCell className="font-medium">{s.title}</TableCell>
                  <TableCell>{s.location}</TableCell>
                  <TableCell>£{Number(s.price || 0).toFixed(2)}</TableCell>
                  <TableCell>{s.offerPrice != null ? `£${Number(s.offerPrice).toFixed(2)}` : '—'}</TableCell>
                  <TableCell><Badge variant={s.status === 'Active' ? 'default' : 'secondary'}>{s.status}</Badge></TableCell>
                  <TableCell>{s.available ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{[s.startDate, s.endDate].filter(Boolean).length ? `${s.startDate?.split('T')[0]} → ${s.endDate?.split('T')[0]}` : '—'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(s)} className="rounded-md"><Edit className="h-4 w-4 mr-1" /> Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteService(s.id)} className="rounded-md"><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Hotel</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
            <div className="md:col-span-2"><Label>Description</Label><textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full min-h-[80px] rounded-md border bg-background p-2" /></div>
            <div><Label>Price</Label><Input type="number" min={0} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value || 0) }))} /></div>
            <div><Label>Offer Price</Label><Input type="number" min={0} value={form.offerPrice ?? ''} onChange={(e) => setForm((f) => ({ ...f, offerPrice: Number(e.target.value || 0) }))} /></div>
            <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} /></div>
            <div className="md:col-span-2"><Label>Image URL</Label><Input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} /></div>
            <div><Label>Status</Label><Select value={form.status} onValueChange={(v: any) => setForm((f) => ({ ...f, status: v }))}><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem><SelectItem value="Archived">Archived</SelectItem></SelectContent></Select></div>
            <div><Label>Available</Label><input type="checkbox" checked={form.available} onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))} /></div>
            <div><Label>Start Date</Label><Input type="date" value={form.startDate ?? ''} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} /></div>
            <div><Label>End Date</Label><Input type="date" value={form.endDate ?? ''} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} /></div>
            <div className="md:col-span-2"><Button variant="outline" onClick={closeAdd}>Cancel</Button> <Button onClick={createService}>Save</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Hotel</DialogHeader></DialogHeader>
          {editItem && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
              <div className="md:col-span-2"><Label>Description</Label><textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full min-h-[80px] rounded-md border bg-background p-2" /></div>
              <div><Label>Price</Label><Input type="number" min={0} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value || 0) }))} /></div>
              <div><Label>Offer Price</Label><Input type="number" min={0} value={form.offerPrice ?? ''} onChange={(e) => setForm((f) => ({ ...f, offerPrice: Number(e.target.value || 0) }))} /></div>
              <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} /></div>
              <div className="md:col-span-2"><Label>Image URL</Label><Input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} /></div>
              <div><Label>Status</Label><Select value={form.status} onValueChange={(v: any) => setForm((f) => ({ ...f, status: v }))}><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem><SelectItem value="Archived">Archived</SelectItem></SelectContent></Select></div>
              <div><Label>Available</Label><input type="checkbox" checked={form.available} onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))} /></div>
              <div><Label>Start Date</Label><Input type="date" value={form.startDate ?? ''} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} /></div>
              <div><Label>End Date</Label><Input type="date" value={form.endDate ?? ''} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} /></div>
              <div className="md:col-span-2"><Button variant="outline" onClick={closeEdit}>Cancel</Button> <Button onClick={updateService}>Save changes</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}


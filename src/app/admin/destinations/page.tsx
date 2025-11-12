"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2 } from 'lucide-react'

type Destination = { id: string; slug: string; name: string; description?: string | null; gallery?: any; attractions?: any; featuredHotelIds?: any }

export default function AdminDestinationsPage() {
  const { toast } = useToast()
  const [rows, setRows] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/destinations', { cache: 'no-store' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.ok) throw new Error(json?.error || res.statusText)
      setRows(json.destinations || [])
    } catch (e: any) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editItem, setEditItem] = useState<Destination | null>(null)
  const [form, setForm] = useState<Destination>({ id: '', slug: '', name: '', description: '', gallery: [], attractions: [], featuredHotelIds: [] })

  const openAdd = () => { setForm({ id: '', slug: '', name: '', description: '', gallery: [], attractions: [], featuredHotelIds: [] }); setIsAddOpen(true) }
  const openEdit = (d: Destination) => { setEditItem(d); setForm({ ...d }); setIsEditOpen(true) }
  const closeAdd = () => setIsAddOpen(false)
  const closeEdit = () => { setIsEditOpen(false); setEditItem(null) }

  const create = async () => {
    try {
      const payload: any = { ...form }
      delete payload.id
      payload.gallery = (Array.isArray(payload.gallery) ? payload.gallery : String(payload.gallery || '').split(',').map(s => s.trim()).filter(Boolean))
      payload.attractions = (Array.isArray(payload.attractions) ? payload.attractions : String(payload.attractions || '').split(',').map(s => s.trim()).filter(Boolean))
      payload.featuredHotelIds = (Array.isArray(payload.featuredHotelIds) ? payload.featuredHotelIds : String(payload.featuredHotelIds || '').split(',').map(s => s.trim()).filter(Boolean))
      const res = await fetch('/api/admin/destinations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.ok) throw new Error(json?.error || res.statusText)
      toast({ title: 'Added', description: 'Destination created.' })
      await load()
      closeAdd()
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Add failed', description: e?.message || String(e) })
    }
  }

  const update = async () => {
    if (!editItem) return
    try {
      const payload: any = { ...form }
      delete payload.id
      payload.gallery = (Array.isArray(payload.gallery) ? payload.gallery : String(payload.gallery || '').split(',').map(s => s.trim()).filter(Boolean))
      payload.attractions = (Array.isArray(payload.attractions) ? payload.attractions : String(payload.attractions || '').split(',').map(s => s.trim()).filter(Boolean))
      payload.featuredHotelIds = (Array.isArray(payload.featuredHotelIds) ? payload.featuredHotelIds : String(payload.featuredHotelIds || '').split(',').map(s => s.trim()).filter(Boolean))
      const res = await fetch(`/api/admin/destinations/${encodeURIComponent(editItem.id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.ok) throw new Error(json?.error || res.statusText)
      toast({ title: 'Updated', description: 'Destination updated.' })
      await load()
      closeEdit()
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Update failed', description: e?.message || String(e) })
    }
  }

  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/destinations/${encodeURIComponent(id)}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.ok) throw new Error(json?.error || res.statusText)
      toast({ title: 'Deleted', description: 'Destination removed.' })
      await load()
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Delete failed', description: e?.message || String(e) })
    }
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>Destinations</CardTitle>
          <CardDescription>Manage regions and destination content.</CardDescription>
        </div>
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" /> Add Destination</Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="font-medium">Slug</TableCell>
                <TableCell className="font-medium">Name</TableCell>
                <TableCell className="font-medium">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>}
              {!!error && <TableRow><TableCell colSpan={3} className="text-red-600">Error: {String(error.message || error)}</TableCell></TableRow>}
              {!loading && !error && rows.length === 0 && <TableRow><TableCell colSpan={3}>No destinations. Click Add.</TableCell></TableRow>}
              {rows.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.slug}</TableCell>
                  <TableCell>{d.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(d)} className="rounded-md"><Edit className="h-4 w-4 mr-1" /> Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => remove(d.id)} className="rounded-md"><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader><DialogTitle>Add Destination</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} /></div>
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div className="md:col-span-2"><Label>Description</Label><Input value={String(form.description || '')} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
            <div className="md:col-span-2"><Label>Gallery URLs (comma)</Label><Input value={Array.isArray(form.gallery) ? (form.gallery as any[]).join(', ') : String(form.gallery || '')} onChange={(e) => setForm((f) => ({ ...f, gallery: e.target.value }))} /></div>
            <div className="md:col-span-2"><Label>Attractions (comma)</Label><Input value={Array.isArray(form.attractions) ? (form.attractions as any[]).join(', ') : String(form.attractions || '')} onChange={(e) => setForm((f) => ({ ...f, attractions: e.target.value }))} /></div>
            <div className="md:col-span-2"><Label>Featured Hotel IDs (comma)</Label><Input value={Array.isArray(form.featuredHotelIds) ? (form.featuredHotelIds as any[]).join(', ') : String(form.featuredHotelIds || '')} onChange={(e) => setForm((f) => ({ ...f, featuredHotelIds: e.target.value }))} /></div>
            <div className="md:col-span-2"><Button variant="outline" onClick={closeAdd}>Cancel</Button> <Button onClick={create}>Save</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader><DialogTitle>Edit Destination</DialogTitle></DialogHeader>
          {editItem && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} /></div>
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
              <div className="md:col-span-2"><Label>Description</Label><Input value={String(form.description || '')} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
              <div className="md:col-span-2"><Label>Gallery URLs (comma)</Label><Input value={Array.isArray(form.gallery) ? (form.gallery as any[]).join(', ') : String(form.gallery || '')} onChange={(e) => setForm((f) => ({ ...f, gallery: e.target.value }))} /></div>
              <div className="md:col-span-2"><Label>Attractions (comma)</Label><Input value={Array.isArray(form.attractions) ? (form.attractions as any[]).join(', ') : String(form.attractions || '')} onChange={(e) => setForm((f) => ({ ...f, attractions: e.target.value }))} /></div>
              <div className="md:col-span-2"><Label>Featured Hotel IDs (comma)</Label><Input value={Array.isArray(form.featuredHotelIds) ? (form.featuredHotelIds as any[]).join(', ') : String(form.featuredHotelIds || '')} onChange={(e) => setForm((f) => ({ ...f, featuredHotelIds: e.target.value }))} /></div>
              <div className="md:col-span-2"><Button variant="outline" onClick={closeEdit}>Cancel</Button> <Button onClick={update}>Save changes</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}


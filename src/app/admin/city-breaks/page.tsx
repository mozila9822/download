'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Table, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

type Testimonial = { name: string; quote: string; photoUrl?: string }
type FaqItem = { question: string; answer: string }
type CityBreak = {
  name: string
  location: string
  country?: string
  tagline?: string
  description?: string
  duration: string
  bestSeason?: string
  activityType?: string
  price: number
  offerPrice?: number
  imageUrl: string
  status?: 'Active' | 'Inactive'
  popularity?: number
  highlights?: string[]
  datesAvailable?: string[]
  flexibleDates?: boolean
  departureCities?: string[]
  inclusions?: string[]
  exclusions?: string[]
  hotelName?: string
  hotelStars?: number
  hotelDescription?: string
  hotelGallery?: string[]
  gallery?: string[]
  testimonials?: Testimonial[]
  relatedIds?: string[]
  faq?: FaqItem[]
}

type WithId<T> = T & { id: string }

export default function CityBreakAdminPage() {
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

  const fromService = (s: ServiceDto): WithId<CityBreak> => ({
    id: s.id,
    name: s.title,
    location: s.location,
    country: '',
    tagline: '',
    description: s.description || '',
    duration: '',
    bestSeason: '',
    activityType: '',
    price: Number(s.price || 0),
    offerPrice: s.offerPrice,
    imageUrl: s.imageUrl || '',
    status: s.status === 'Inactive' ? 'Inactive' : 'Active',
    popularity: 0,
    highlights: [],
    datesAvailable: [],
    flexibleDates: false,
    departureCities: [],
    inclusions: [],
    exclusions: [],
    hotelName: '',
    hotelStars: undefined,
    hotelDescription: '',
    hotelGallery: [],
    gallery: [],
    testimonials: [],
    relatedIds: [],
    faq: [],
  })

  const toServicePayload = (f: CityBreak) => ({
    category: 'City Break',
    title: f.name || f.location || 'City Break',
    description: f.description || '',
    price: Number(f.price || 0),
    offerPrice: f.offerPrice != null ? Number(f.offerPrice) : undefined,
    location: f.location || f.name || '',
    imageUrl: f.imageUrl || '',
    status: f.status || 'Active',
    available: (f.status || 'Active') !== 'Inactive',
  })

  const [data, setData] = useState<WithId<CityBreak>[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<any>(null)

  const loadRows = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/services?category=City%20Break', { cache: 'no-store' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.ok) throw new Error(json?.error || res.statusText)
      const rows: ServiceDto[] = json.services || []
      setData(rows.map(fromService))
    } catch (e: any) {
      setError(e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRows()
  }, [loadRows])

  const [searchTerm, setSearchTerm] = useState('')
  const [priceFilter, setPriceFilter] = useState<{ min: number; max: number }>({ min: 0, max: 500000 })
  const [popularityFilter, setPopularityFilter] = useState<'All' | 'Trending' | 'Top'>('All')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All')

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editItem, setEditItem] = useState<WithId<CityBreak> | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { toast } = useToast()

  const filtered = useMemo(() => {
    let rows = (data ?? [])
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase()
      rows = rows.filter(
        (r) => (r.name || '').toLowerCase().includes(q) || (r.location || '').toLowerCase().includes(q) || (r.country || '').toLowerCase().includes(q)
      )
    }
    rows = rows.filter((r) => {
      const price = Number(r.price || 0)
      return price >= priceFilter.min && price <= priceFilter.max
    })
    if (statusFilter !== 'All') {
      rows = rows.filter((r) => (r.status || 'Active') === statusFilter)
    }
    if (popularityFilter === 'Trending') {
      rows = rows.filter((r) => Number(r.popularity || 0) >= 50)
    } else if (popularityFilter === 'Top') {
      rows = rows.filter((r) => Number(r.popularity || 0) >= 80)
    }
    rows = rows
      .slice()
      .sort((a, b) => Number(b.popularity || 0) - Number(a.popularity || 0) || String(a.name).localeCompare(String(b.name)))
    return rows
  }, [data, searchTerm, priceFilter, statusFilter, popularityFilter])

  const [form, setForm] = useState<CityBreak>({
    name: '',
    location: '',
    country: '',
    tagline: '',
    description: '',
    duration: '',
    bestSeason: '',
    activityType: '',
    price: 0,
    offerPrice: undefined,
    imageUrl: '',
    status: 'Active',
    popularity: 0,
    highlights: [],
    datesAvailable: [],
    flexibleDates: false,
    departureCities: [],
    inclusions: [],
    exclusions: [],
    hotelName: '',
    hotelStars: undefined,
    hotelDescription: '',
    hotelGallery: [],
    gallery: [],
    testimonials: [],
    relatedIds: [],
    faq: [],
  })

  useEffect(() => {
    if (isEditOpen && editItem) {
      setForm({
        name: editItem.name || '',
        location: editItem.location || '',
        country: editItem.country || '',
        tagline: editItem.tagline || '',
        description: editItem.description || '',
        duration: editItem.duration || '',
        bestSeason: editItem.bestSeason || '',
        activityType: editItem.activityType || '',
        price: Number(editItem.price || 0),
        offerPrice: editItem.offerPrice,
        imageUrl: editItem.imageUrl || '',
        status: editItem.status || 'Active',
        popularity: Number(editItem.popularity || 0),
        highlights: editItem.highlights || [],
        datesAvailable: editItem.datesAvailable || [],
        flexibleDates: !!editItem.flexibleDates,
        departureCities: editItem.departureCities || [],
        inclusions: editItem.inclusions || [],
        exclusions: editItem.exclusions || [],
        hotelName: editItem.hotelName || '',
        hotelStars: editItem.hotelStars,
        hotelDescription: editItem.hotelDescription || '',
        hotelGallery: editItem.hotelGallery || [],
        gallery: editItem.gallery || [],
        testimonials: editItem.testimonials || [],
        relatedIds: editItem.relatedIds || [],
        faq: editItem.faq || [],
      })
    }
  }, [isEditOpen, editItem])

  const resetForm = () => {
    setForm({
      name: '',
      location: '',
      country: '',
      tagline: '',
      description: '',
      duration: '',
      bestSeason: '',
      activityType: '',
      price: 0,
      offerPrice: undefined,
      imageUrl: '',
      status: 'Active',
      popularity: 0,
      highlights: [],
      datesAvailable: [],
      flexibleDates: false,
      departureCities: [],
      inclusions: [],
      exclusions: [],
      hotelName: '',
      hotelStars: undefined,
      hotelDescription: '',
      hotelGallery: [],
      gallery: [],
      testimonials: [],
      relatedIds: [],
      faq: [],
    })
  }

  const openAdd = () => {
    resetForm()
    setIsAddOpen(true)
  }
  const openEdit = (item: WithId<CityBreak>) => {
    setEditItem(item)
    setIsEditOpen(true)
  }
  const openDelete = (id: string) => {
    setDeleteId(id)
    setIsDeleteOpen(true)
  }

  const closeAdd = () => setIsAddOpen(false)
  const closeEdit = () => {
    setIsEditOpen(false)
    setEditItem(null)
  }
  const closeDelete = () => {
    setIsDeleteOpen(false)
    setDeleteId(null)
  }

  const createCityBreak = async () => {
    try {
      const payload = toServicePayload(form)
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.ok) throw new Error(json?.error || res.statusText)
      toast({ title: 'Added', description: 'City break created.' })
      await loadRows()
      closeAdd()
      resetForm()
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Add failed', description: e?.message || String(e) })
    }
  }

  const updateCityBreak = async () => {
    if (!editItem) return
    try {
      const payload = toServicePayload(form)
      const res = await fetch(`/api/admin/services/${encodeURIComponent(editItem.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.ok) throw new Error(json?.error || res.statusText)
      toast({ title: 'Updated', description: 'City break updated.' })
      await loadRows()
      closeEdit()
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Update failed', description: e?.message || String(e) })
    }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/admin/services/${encodeURIComponent(deleteId)}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.ok) throw new Error(json?.error || res.statusText)
      toast({ title: 'Deleted', description: 'City break removed.' })
      await loadRows()
      closeDelete()
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Delete failed', description: e?.message || String(e) })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>City Break Management</CardTitle>
          <CardDescription>Manage city breaks: create, edit, delete, and filter.</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button onClick={openAdd} className="rounded-lg">
            <Plus className="h-4 w-4 mr-2" /> Add City Break
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Input placeholder="Search by city, country..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2">
            <Label className="whitespace-nowrap">Min Price</Label>
            <Input type="number" min={0} value={priceFilter.min} onChange={(e) => setPriceFilter((p) => ({ ...p, min: Number(e.target.value || 0) }))} />
            <Label className="whitespace-nowrap">Max Price</Label>
            <Input type="number" min={0} value={priceFilter.max} onChange={(e) => setPriceFilter((p) => ({ ...p, max: Number(e.target.value || 0) }))} />
          </div>
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={popularityFilter} onValueChange={(v: any) => setPopularityFilter(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Popularity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Trending">Trending (50+)</SelectItem>
              <SelectItem value="Top">Top (80+)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="font-medium">Featured Image</TableCell>
                <TableCell className="font-medium">City</TableCell>
                <TableCell className="font-medium">Country</TableCell>
                <TableCell className="font-medium">Price</TableCell>
                <TableCell className="font-medium">Duration</TableCell>
                <TableCell className="font-medium">Status</TableCell>
                <TableCell className="font-medium">Popularity</TableCell>
                <TableCell className="font-medium">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={8}>Loading...</TableCell></TableRow>}
              {!!error && <TableRow><TableCell colSpan={8} className="text-red-600">Error: {String(error.message || error)}</TableCell></TableRow>}
              {!isLoading && !error && filtered.length === 0 && <TableRow><TableCell colSpan={8}>No city breaks found. Click "Add City Break".</TableCell></TableRow>}
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name || item.location} className="h-16 w-24 object-cover rounded-md border" />
                    ) : (
                      <div className="h-16 w-24 bg-muted rounded-md grid place-items-center text-xs text-muted-foreground">No Image</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{item.location || item.name}</TableCell>
                  <TableCell>{item.country || '-'}</TableCell>
                  <TableCell>₹{Number(item.price || 0).toLocaleString()}</TableCell>
                  <TableCell>{item.duration || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>{item.status || 'Active'}</Badge>
                  </TableCell>
                  <TableCell>{Number(item.popularity || 0)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(item)} className="rounded-md">
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button asChild variant="secondary" size="sm" className="rounded-md">
                    <a href={`/city-break/${item.id}`} target="_blank" rel="noreferrer">
                      <Eye className="h-4 w-4 mr-1" /> View Page
                    </a>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => openDelete(item.id)} className="rounded-md">
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
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
          <DialogHeader>
            <DialogTitle>Add City Break</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>City</Label>
              <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="e.g. Paris" />
            </div>
            <div>
              <Label>Country</Label>
              <Input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} placeholder="e.g. France" />
            </div>
            <div className="md:col-span-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Package name" />
            </div>
            <div className="md:col-span-2">
              <Label>Tagline</Label>
              <Input value={form.tagline ?? ''} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} placeholder="Short tagline for hero section" />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Short description" className="w-full min-h-[80px] rounded-md border bg-background p-2" />
            </div>
            <div>
              <Label>Duration</Label>
              <Input value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} placeholder="e.g. 3 days / 2 nights" />
            </div>
            <div>
              <Label>Best Season</Label>
              <Input value={form.bestSeason ?? ''} onChange={(e) => setForm((f) => ({ ...f, bestSeason: e.target.value }))} placeholder="e.g. Spring / Summer" />
            </div>
            <div>
              <Label>Activity Type</Label>
              <Input value={form.activityType ?? ''} onChange={(e) => setForm((f) => ({ ...f, activityType: e.target.value }))} placeholder="e.g. Culture / Food / Nightlife" />
            </div>
            <div>
              <Label>Price</Label>
              <Input type="number" min={0} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value || 0) }))} placeholder="e.g. 25000" />
            </div>
            <div>
              <Label>Offer Price (optional)</Label>
              <Input type="number" min={0} value={form.offerPrice ?? ''} onChange={(e) => setForm((f) => ({ ...f, offerPrice: Number(e.target.value || 0) }))} placeholder="e.g. 22000" />
            </div>
            <div className="md:col-span-2">
              <Label>Featured Image URL</Label>
              <Input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v: any) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Popularity</Label>
              <Input type="number" min={0} max={100} value={form.popularity} onChange={(e) => setForm((f) => ({ ...f, popularity: Number(e.target.value || 0) }))} />
            </div>
            <div className="md:col-span-2">
              <Label>Highlights (comma separated)</Label>
              <Input value={(form.highlights ?? []).join(', ')}
                     onChange={(e) => setForm((f) => ({ ...f, highlights: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))}
                     placeholder="e.g. Louvre & Museums, Wine Tasting, Shopping" />
            </div>
            <div>
              <Label>Flexible Dates</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch checked={!!form.flexibleDates} onCheckedChange={(v) => setForm((f) => ({ ...f, flexibleDates: v }))} />
                <span className="text-sm text-muted-foreground">Enable if dates are flexible</span>
              </div>
            </div>
            <div>
              <Label>Dates Available (comma separated)</Label>
              <Input value={(form.datesAvailable ?? []).join(', ')} onChange={(e) => setForm((f) => ({ ...f, datesAvailable: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} placeholder="e.g. 12-15 Mar, 20-23 Apr" />
            </div>
            <div className="md:col-span-2">
              <Label>Departure Cities (comma separated)</Label>
              <Input value={(form.departureCities ?? []).join(', ')} onChange={(e) => setForm((f) => ({ ...f, departureCities: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} placeholder="e.g. London, Manchester" />
            </div>
            <div className="md:col-span-2">
              <Label>Inclusions (comma separated)</Label>
              <Input value={(form.inclusions ?? []).join(', ')} onChange={(e) => setForm((f) => ({ ...f, inclusions: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} placeholder="e.g. Flights, Hotel, Guided Tours" />
            </div>
            <div className="md:col-span-2">
              <Label>Exclusions (comma separated)</Label>
              <Input value={(form.exclusions ?? []).join(', ')} onChange={(e) => setForm((f) => ({ ...f, exclusions: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} placeholder="e.g. Meals, Transfers" />
            </div>
            <div>
              <Label>Hotel Name</Label>
              <Input value={form.hotelName ?? ''} onChange={(e) => setForm((f) => ({ ...f, hotelName: e.target.value }))} placeholder="e.g. Grand Paris Hotel" />
            </div>
            <div>
              <Label>Hotel Stars</Label>
              <Input type="number" min={1} max={5} value={form.hotelStars ?? ''} onChange={(e) => setForm((f) => ({ ...f, hotelStars: Number(e.target.value || 0) }))} placeholder="e.g. 4" />
            </div>
            <div className="md:col-span-2">
              <Label>Hotel Description</Label>
              <textarea value={form.hotelDescription ?? ''} onChange={(e) => setForm((f) => ({ ...f, hotelDescription: e.target.value }))} className="w-full min-h-[80px] rounded-md border bg-background p-2" />
            </div>
            <div className="md:col-span-2">
              <Label>Hotel Gallery URLs (comma separated)</Label>
              <Input value={(form.hotelGallery ?? []).join(', ')} onChange={(e) => setForm((f) => ({ ...f, hotelGallery: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} placeholder="https://img1.jpg, https://img2.jpg" />
            </div>
            <div className="md:col-span-2">
              <Label>Gallery URLs (comma separated)</Label>
              <Input value={(form.gallery ?? []).join(', ')} onChange={(e) => setForm((f) => ({ ...f, gallery: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} placeholder="https://imgA.jpg, https://imgB.jpg" />
            </div>
            <div className="md:col-span-2">
              <Label>Testimonials (one per line: Name | Quote | PhotoUrl)</Label>
              <textarea
                value={(form.testimonials ?? []).map((t) => `${t.name || ''} | ${t.quote || ''} | ${t.photoUrl || ''}`).join('\n')}
                onChange={(e) => {
                  const lines = e.target.value.split('\n').map((l) => l.trim()).filter(Boolean)
                  const parsed = lines.map((l) => {
                    const [name, quote, photoUrl] = l.split('|').map((s) => s.trim())
                    return { name, quote, photoUrl }
                  })
                  setForm((f) => ({ ...f, testimonials: parsed }))
                }}
                className="w-full min-h-[100px] rounded-md border bg-background p-2"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Related Package IDs (comma separated)</Label>
              <Input value={(form.relatedIds ?? []).join(', ')} onChange={(e) => setForm((f) => ({ ...f, relatedIds: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} placeholder="docId1, docId2" />
            </div>
            <div className="md:col-span-2">
              <Label>FAQ (one per line: Question | Answer)</Label>
              <textarea
                value={(form.faq ?? []).map((q) => `${q.question || ''} | ${q.answer || ''}`).join('\n')}
                onChange={(e) => {
                  const lines = e.target.value.split('\n').map((l) => l.trim()).filter(Boolean)
                  const parsed = lines.map((l) => {
                    const [question, answer] = l.split('|').map((s) => s.trim())
                    return { question, answer }
                  })
                  setForm((f) => ({ ...f, faq: parsed }))
                }}
                className="w-full min-h-[100px] rounded-md border bg-background p-2"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={closeAdd}>Cancel</Button>
            <Button onClick={createCityBreak}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit City Break</DialogTitle>
          </DialogHeader>
          {editItem && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>City</Label>
                  <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full min-h-[80px] rounded-md border bg-background p-2" />
                </div>
                <div className="md:col-span-2">
                  <Label>Tagline</Label>
                  <Input value={form.tagline ?? ''} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} />
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} />
                </div>
                <div>
                  <Label>Best Season</Label>
                  <Input value={form.bestSeason ?? ''} onChange={(e) => setForm((f) => ({ ...f, bestSeason: e.target.value }))} />
                </div>
                <div>
                  <Label>Activity Type</Label>
                  <Input value={form.activityType ?? ''} onChange={(e) => setForm((f) => ({ ...f, activityType: e.target.value }))} />
                </div>
                <div>
                  <Label>Price</Label>
                  <Input type="number" min={0} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value || 0) }))} />
                </div>
                <div>
                  <Label>Offer Price</Label>
                  <Input type="number" min={0} value={form.offerPrice ?? ''} onChange={(e) => setForm((f) => ({ ...f, offerPrice: Number(e.target.value || 0) }))} />
                </div>
                <div className="md:col-span-2">
                  <Label>Featured Image URL</Label>
                  <Input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v: any) => setForm((f) => ({ ...f, status: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Popularity</Label>
                  <Input type="number" min={0} max={100} value={form.popularity} onChange={(e) => setForm((f) => ({ ...f, popularity: Number(e.target.value || 0) }))} />
                </div>
                <div className="md:col-span-2">
                  <Label>Highlights (comma separated)</Label>
                  <Input value={(form.highlights ?? []).join(', ')} onChange={(e) => setForm((f) => ({ ...f, highlights: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} />
                </div>
                <div>
                  <Label>Flexible Dates</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch checked={!!form.flexibleDates} onCheckedChange={(v) => setForm((f) => ({ ...f, flexibleDates: v }))} />
                    <span className="text-sm text-muted-foreground">Enable if dates are flexible</span>
                  </div>
                </div>
                <div>
                  <Label>Dates Available (comma separated)</Label>
                  <Input value={(form.datesAvailable ?? []).join(', ')} onChange={(e) => setForm((f) => ({ ...f, datesAvailable: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} />
                </div>
                <div className="md:col-span-2">
                  <Label>Departure Cities (comma separated)</Label>
                  <Input value={(form.departureCities ?? []).join(', ')} onChange={(e) => setForm((f) => ({ ...f, departureCities: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} />
                </div>
                <div className="md:col-span-2">
                  <Label>Inclusions (comma separated)</Label>
                  <Input value={(form.inclusions ?? []).join(', ')} onChange={(e) => setForm((f) => ({ ...f, inclusions: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} />
                </div>
                <div className="md:col-span-2">
                  <Label>Exclusions (comma separated)</Label>
                  <Input value={(form.exclusions ?? []).join(', ')} onChange={(e) => setForm((f) => ({ ...f, exclusions: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} />
                </div>
                <div>
                  <Label>Hotel Name</Label>
                  <Input value={form.hotelName ?? ''} onChange={(e) => setForm((f) => ({ ...f, hotelName: e.target.value }))} />
                </div>
                <div>
                  <Label>Hotel Stars</Label>
                  <Input type="number" min={1} max={5} value={form.hotelStars ?? ''} onChange={(e) => setForm((f) => ({ ...f, hotelStars: Number(e.target.value || 0) }))} />
                </div>
                <div className="md:col-span-2">
                  <Label>Hotel Description</Label>
                  <textarea value={form.hotelDescription ?? ''} onChange={(e) => setForm((f) => ({ ...f, hotelDescription: e.target.value }))} className="w-full min-h-[80px] rounded-md border bg-background p-2" />
                </div>
                <div className="md:col-span-2">
                  <Label>Hotel Gallery URLs (comma separated)</Label>
                  <Input value={(form.hotelGallery ?? []).join(', ')} onChange={(e) => setForm((f) => ({ ...f, hotelGallery: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} />
                </div>
                <div className="md:col-span-2">
                  <Label>Gallery URLs (comma separated)</Label>
                  <Input value={(form.gallery ?? []).join(', ')} onChange={(e) => setForm((f) => ({ ...f, gallery: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} />
                </div>
                <div className="md:col-span-2">
                  <Label>Testimonials (one per line: Name | Quote | PhotoUrl)</Label>
                  <textarea
                    value={(form.testimonials ?? []).map((t) => `${t.name || ''} | ${t.quote || ''} | ${t.photoUrl || ''}`).join('\n')}
                    onChange={(e) => {
                      const lines = e.target.value.split('\n').map((l) => l.trim()).filter(Boolean)
                      const parsed = lines.map((l) => {
                        const [name, quote, photoUrl] = l.split('|').map((s) => s.trim())
                        return { name, quote, photoUrl }
                      })
                      setForm((f) => ({ ...f, testimonials: parsed }))
                    }}
                    className="w-full min-h-[100px] rounded-md border bg-background p-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Related Package IDs (comma separated)</Label>
                  <Input value={(form.relatedIds ?? []).join(', ')} onChange={(e) => setForm((f) => ({ ...f, relatedIds: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} />
                </div>
                <div className="md:col-span-2">
                  <Label>FAQ (one per line: Question | Answer)</Label>
                  <textarea
                    value={(form.faq ?? []).map((q) => `${q.question || ''} | ${q.answer || ''}`).join('\n')}
                    onChange={(e) => {
                      const lines = e.target.value.split('\n').map((l) => l.trim()).filter(Boolean)
                      const parsed = lines.map((l) => {
                        const [question, answer] = l.split('|').map((s) => s.trim())
                        return { question, answer }
                      })
                      setForm((f) => ({ ...f, faq: parsed }))
                    }}
                    className="w-full min-h-[100px] rounded-md border bg-background p-2"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={closeEdit}>Cancel</Button>
                <Button onClick={updateCityBreak}>Save changes</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete city break?</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="text-sm text-muted-foreground">This action cannot be undone.</div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

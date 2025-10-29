"use client";
import { useEffect, useMemo, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, MoreHorizontal } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

type ServiceRow = {
  id: string;
  category: string;
  title: string;
  description: string;
  price: number;
  offerPrice?: number;
  location: string;
  imageUrl: string;
  status?: 'Active' | 'Inactive' | 'Archived';
  available?: boolean;
  startDate?: string;
  endDate?: string;
  isOffer?: boolean;
};

const UI_CATEGORIES = ['All', 'Trips', 'City Break', 'Tours', 'Coach Rides', 'Last Offers'] as const;
type UiCategory = typeof UI_CATEGORIES[number];

function toApiCategory(ui: UiCategory) {
  switch (ui) {
    case 'City Break':
      return 'City Break';
    case 'Coach Rides':
      return 'Coach Ride';
    case 'Tours':
      return 'Tour';
    case 'Trips':
      return 'Tour'; // Treat Trips as Tours for now
    default:
      return 'All';
  }
}

export default function OperationsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<UiCategory>('Trips');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ServiceRow[]>([]);

  const isOffersTab = useMemo(() => activeTab === 'Last Offers', [activeTab]);
  const apiCategory = useMemo(() => toApiCategory(activeTab), [activeTab]);

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceRow | null>(null);
  const [form, setForm] = useState<Partial<ServiceRow>>({
    category: 'Tour',
    title: '',
    description: '',
    price: 0,
    offerPrice: undefined,
    location: '',
    imageUrl: '',
    status: 'Active',
    available: true,
    startDate: undefined,
    endDate: undefined,
    isOffer: false,
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (apiCategory && apiCategory !== 'All') params.set('category', apiCategory);
      if (search.trim()) params.set('q', search.trim());
      if (isOffersTab) params.set('offerOnly', 'true');
      const res = await fetch(`/api/admin/services?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to load services');
      setRows(json.services as ServiceRow[]);
    } catch (e: any) {
      toast({ title: 'Load failed', description: e?.message || String(e), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      category: apiCategory === 'All' ? 'Tour' : apiCategory,
      title: '',
      description: '',
      price: 0,
      offerPrice: isOffersTab ? 0 : undefined,
      location: '',
      imageUrl: '',
      status: 'Active',
      available: true,
      startDate: undefined,
      endDate: undefined,
      isOffer: isOffersTab,
    });
    setDialogOpen(true);
  };

  const openEdit = (row: ServiceRow) => {
    setEditing(row);
    setForm({ ...row });
    setDialogOpen(true);
  };

  const save = async () => {
    try {
      // Simple validation
      if (!form.category || !form.title || !form.description || !form.location || !form.imageUrl) {
        toast({ title: 'Missing fields', description: 'Fill all required fields.', variant: 'destructive' });
        return;
      }
      const body: any = {
        category: form.category,
        title: form.title,
        description: form.description,
        price: Number(form.price || 0),
        offerPrice: form.offerPrice != null ? Number(form.offerPrice) : undefined,
        location: form.location,
        imageUrl: form.imageUrl,
        status: form.status,
        available: !!form.available,
        startDate: form.startDate,
        endDate: form.endDate,
        isOffer: !!form.isOffer,
      };
      const res = await fetch(editing ? `/api/admin/services/${editing.id}` : '/api/admin/services', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to save service');
      toast({ title: editing ? 'Updated' : 'Created', description: 'Service saved successfully.' });
      setDialogOpen(false);
      await load();
    } catch (e: any) {
      toast({ title: 'Save failed', description: e?.message || String(e), variant: 'destructive' });
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/services/${deleteId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Delete failed');
      toast({ title: 'Deleted', description: 'Service removed.' });
      setDeleteId(null);
      await load();
    } catch (e: any) {
      toast({ title: 'Delete failed', description: e?.message || String(e), variant: 'destructive' });
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const ql = search.trim().toLowerCase();
    return rows.filter((r) =>
      r.title.toLowerCase().includes(ql) ||
      r.location.toLowerCase().includes(ql) ||
      r.description.toLowerCase().includes(ql)
    );
  }, [rows, search]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operations</CardTitle>
        <CardDescription>Manage Trips, City Breaks, Tours, Coach Rides, and Offers.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, location, description"
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as UiCategory)}>
          <TabsList className="flex flex-wrap">
            {UI_CATEGORIES.map((c) => (
              <TabsTrigger key={c} value={c}>{c}</TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={activeTab}>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Offer</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9}>Loading...</TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9}>No items found.</TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.title}</TableCell>
                        <TableCell>{r.category}</TableCell>
                        <TableCell>{r.location}</TableCell>
                        <TableCell>€{r.price.toFixed(2)}</TableCell>
                        <TableCell>{r.offerPrice ? `€${r.offerPrice.toFixed(2)}` : '-'}</TableCell>
                        <TableCell>{r.startDate ? new Date(r.startDate).toLocaleDateString() : '-'} → {r.endDate ? new Date(r.endDate).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{r.status || '-'}</TableCell>
                        <TableCell>{r.available ? 'Yes' : 'No'}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => openEdit(r)}>Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(r.id)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Service' : 'Add Service'}</DialogTitle>
              <DialogDescription>Fill details and save to update the website.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="City Break">City Break</SelectItem>
                    <SelectItem value="Tour">Tours</SelectItem>
                    <SelectItem value="Coach Ride">Coach Rides</SelectItem>
                    <SelectItem value="Hotel">Hotel</SelectItem>
                    <SelectItem value="Flight">Flight</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Title</Label>
                <Input value={form.title || ''} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <Label>Description</Label>
                <Textarea value={form.description || ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <Label>Price (€)</Label>
                <Input type="number" step="0.01" value={String(form.price ?? 0)} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} />
              </div>
              <div>
                <Label>Offer Price (€)</Label>
                <Input type="number" step="0.01" value={form.offerPrice != null ? String(form.offerPrice) : ''} onChange={(e) => setForm((f) => ({ ...f, offerPrice: e.target.value ? Number(e.target.value) : undefined }))} />
              </div>
              <div>
                <Label>Location</Label>
                <Input value={form.location || ''} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input value={form.imageUrl || ''} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status || 'Active'} onValueChange={(v) => setForm((f) => ({ ...f, status: v as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Available</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox checked={!!form.available} onCheckedChange={(v) => setForm((f) => ({ ...f, available: !!v }))} />
                  <span>{form.available ? 'Available' : 'Unavailable'}</span>
                </div>
              </div>
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={form.startDate ? form.startDate.substring(0, 10) : ''} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined }))} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={form.endDate ? form.endDate.substring(0, 10) : ''} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined }))} />
              </div>
              <div className="md:col-span-2">
                <Label>Image Preview</Label>
                <div className="mt-2 border rounded p-2">
                  {form.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.imageUrl} alt="Preview" className="max-h-40 object-cover" />
                  ) : (
                    <div className="text-sm text-muted-foreground">Enter an image URL to preview.</div>
                  )}
                </div>
              </div>
              <div className="md:col-span-2 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={save}>{editing ? 'Save Changes' : 'Create'}</Button>
              </div>
            </div>
            <DialogFooter />
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteId} onOpenChange={(o) => setDeleteId(o ? deleteId : null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete service?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone and will remove the service from the website.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}

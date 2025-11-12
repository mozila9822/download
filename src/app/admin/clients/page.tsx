'use client';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Search } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
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

export default function ClientsPage() {
  const [clients, setClients] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [selected, setSelected] = useState<any | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editStatus, setEditStatus] = useState('Active');
  const [editCompany, setEditCompany] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/users?role=User', { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to fetch clients: ${res.status}`);
        const data = await res.json();
        if (!cancelled) setClients(data);
      } catch (e) {
        console.error('Clients fetch error', e);
        if (!cancelled) setClients([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  function onView(client: any) {
    setSelected(client);
    setViewOpen(true);
  }

  function onEdit(client: any) {
    setSelected(client);
    setEditFirstName(client.firstName || '');
    setEditLastName(client.lastName || '');
    setEditStatus(client.status || 'Active');
    setEditCompany(client.company || '');
    setEditOpen(true);
  }

  function onDelete(client: any) {
    setSelected(client);
    setDeleteOpen(true);
  }

  async function handleEditSave() {
    if (!selected) return;
    try {
      setIsSaving(true);
      const res = await fetch(`/api/users/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: editFirstName,
          lastName: editLastName,
          status: editStatus,
          company: editCompany,
          role: 'User',
        }),
      });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      const updated = await res.json().catch(() => ({
        id: selected.id,
        firstName: editFirstName,
        lastName: editLastName,
        status: editStatus,
        company: editCompany,
        role: 'User',
      }));
      setClients((prev) =>
        (prev || []).map((c) => (c.id === selected.id ? { ...c, ...updated } : c))
      );
      toast({ title: 'Client updated', description: `${updated.firstName} ${updated.lastName}` });
      setEditOpen(false);
    } catch (e: any) {
      toast({ title: 'Update failed', description: e?.message || 'Please try again', variant: 'destructive' as any });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!selected) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/users/${selected.id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) throw new Error(`Delete failed: ${res.status}`);
      setClients((prev) => (prev || []).filter((c) => c.id !== selected.id));
      toast({ title: 'Client deleted', description: `${selected.firstName} ${selected.lastName}` });
      setDeleteOpen(false);
    } catch (e: any) {
      toast({ title: 'Delete failed', description: e?.message || 'Please try again', variant: 'destructive' as any });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Tabs defaultValue="all">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
        </TabsList>
        <div className="flex gap-2">
            <Button asChild>
              <Link href="/admin/clients/add">
                <Plus className="mr-2" /> Add New
              </Link>
            </Button>
            <Button asChild variant="secondary">
                <Link href="/admin/seed-db">
                    Seed Database
                </Link>
            </Button>
        </div>
      </div>

      <TabsContent value="all">
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Clients & Companies Overview</CardTitle>
            <CardDescription>
              View and manage all your clients and partner companies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Overview of clients and companies will be displayed here,
              including stats and recent activity.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="clients">
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Manage Clients</CardTitle>
            <CardDescription>
              A list of all individual clients in your system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
                 <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                    type="search"
                    placeholder="Search clients..."
                    className="w-full appearance-none bg-background pl-8 shadow-none md:w-1/3"
                    />
                </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                    </TableRow>
                )}
                {clients && clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://picsum.photos/seed/client-${client.id}/40/40`} />
                          <AvatarFallback>{client.firstName?.charAt(0)}{client.lastName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{client.firstName} {client.lastName}</div>
                          <div className="text-sm text-muted-foreground">{client.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{client.company || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={client.status === 'Active' ? 'secondary' : 'outline'}>{client.status || 'Active'}</Badge>
                    </TableCell>
                    <TableCell>{client.addedDate || new Date().toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onView(client); }}>View Details</DropdownMenuItem>
                                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onEdit(client); }}>Edit Client</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onSelect={(e) => { e.preventDefault(); onDelete(client); }}>Delete Client</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          {/* View Details Modal */}
          <Dialog open={viewOpen} onOpenChange={setViewOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Client Details</DialogTitle>
                <DialogDescription>View client information.</DialogDescription>
              </DialogHeader>
              {selected && (
                <div className="space-y-3">
                  <div className="font-medium">{selected.firstName} {selected.lastName}</div>
                  <div className="text-sm text-muted-foreground">{selected.email}</div>
                  <div className="flex gap-2">
                    <Badge variant={selected.status === 'Active' ? 'secondary' : 'outline'}>{selected.status || 'Active'}</Badge>
                    <Badge variant="outline">{selected.company || 'N/A'}</Badge>
                  </div>
                  <div className="text-sm">Added: {selected.addedDate || new Date().toLocaleDateString()}</div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => setViewOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Client Modal */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Client</DialogTitle>
                <DialogDescription>Update client details.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select value={editStatus} onValueChange={setEditStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" value={editCompany} onChange={(e) => setEditCompany(e.target.value)} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button onClick={handleEditSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation */}
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete client?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone and will remove the client from the list.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteOpen(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Card>
      </TabsContent>
      <TabsContent value="companies">
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Manage Companies</CardTitle>
            <CardDescription>
              A table of all partner companies will be here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Company management interface will be here.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

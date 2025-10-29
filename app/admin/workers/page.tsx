'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function WorkersPage() {
  const [workers, setWorkers] = useState<any[] | null>(null);
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
  const [editRole, setEditRole] = useState('User');
  const [editStatus, setEditStatus] = useState('Active');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/users', { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to fetch workers: ${res.status}`);
        const data = await res.json();
        if (!cancelled) setWorkers(data);
      } catch (e) {
        console.error('Workers fetch error', e);
        if (!cancelled) setWorkers([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  function onView(worker: any) {
    setSelected(worker);
    setViewOpen(true);
  }

  function onEdit(worker: any) {
    setSelected(worker);
    setEditFirstName(worker.firstName || '');
    setEditLastName(worker.lastName || '');
    setEditRole(worker.role || 'User');
    setEditStatus(worker.status || 'Active');
    setEditOpen(true);
  }

  function onDelete(worker: any) {
    setSelected(worker);
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
          role: editRole,
          status: editStatus,
        }),
      });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      const updated = await res.json().catch(() => ({
        id: selected.id,
        firstName: editFirstName,
        lastName: editLastName,
        role: editRole,
        status: editStatus,
      }));
      setWorkers((prev) =>
        (prev || []).map((w) => (w.id === selected.id ? { ...w, ...updated } : w))
      );
      toast({ title: 'Worker updated', description: `${updated.firstName} ${updated.lastName}` });
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
      setWorkers((prev) => (prev || []).filter((w) => w.id !== selected.id));
      toast({ title: 'Worker deleted', description: `${selected.firstName} ${selected.lastName}` });
      setDeleteOpen(false);
    } catch (e: any) {
      toast({ title: 'Delete failed', description: e?.message || 'Please try again', variant: 'destructive' as any });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Workers / Staff Directory</CardTitle>
          <CardDescription>
            Manage all worker and staff information.
          </CardDescription>
        </div>
        <Button asChild>
          <Link href="/admin/workers/add">
            <Plus className="mr-2" /> Add Staff
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
         <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Role</TableHead>
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
                {workers && workers.map((worker) => (
                  <TableRow key={worker.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://i.pravatar.cc/40?u=${worker.id}`} />
                          <AvatarFallback>{worker.firstName?.charAt(0)}{worker.lastName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{worker.firstName} {worker.lastName}</div>
                          <div className="text-sm text-muted-foreground">{worker.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{worker.role}</TableCell>
                    <TableCell>
                      <Badge variant={worker.status === 'Active' ? 'secondary' : 'outline'}>{worker.status || 'Active'}</Badge>
                    </TableCell>
                    <TableCell>{worker.addedDate || new Date().toLocaleDateString()}</TableCell>
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
                                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onView(worker); }}>View Details</DropdownMenuItem>
                                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onEdit(worker); }}>Edit Permissions</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onSelect={(e) => { e.preventDefault(); onDelete(worker); }}>Delete</DropdownMenuItem>
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
            <DialogTitle>Worker Details</DialogTitle>
            <DialogDescription>View staff information.</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div className="font-medium">{selected.firstName} {selected.lastName}</div>
              <div className="text-sm text-muted-foreground">{selected.email}</div>
              <div className="flex gap-2">
                <Badge variant={selected.status === 'Active' ? 'secondary' : 'outline'}>{selected.status || 'Active'}</Badge>
                <Badge variant="outline">{selected.role}</Badge>
              </div>
              <div className="text-sm">Added: {selected.addedDate || new Date().toLocaleDateString()}</div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Worker Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Worker</DialogTitle>
            <DialogDescription>Update staff details and permissions.</DialogDescription>
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
                <Label>Role</Label>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Staff">Staff</SelectItem>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="SuperAdmin">SuperAdmin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            <AlertDialogTitle>Delete worker?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone and will remove the worker from the list.
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
  );
}

'use client';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

type BookingRow = {
  id: string;
  customerName: string;
  serviceTitle: string;
  status: string;
  bookingDate: string;
  totalPrice: number;
  travelDate?: string;
  numberOfTravelers?: number;
  paymentStatus?: string;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingRow[] | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<BookingRow | null>(null);
  const [form, setForm] = useState<{ status: string; paymentStatus: string; travelDate: string; numberOfTravelers: number }>({
    status: 'Pending',
    paymentStatus: 'Pending',
    travelDate: '',
    numberOfTravelers: 1,
  });

  async function refresh() {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      setBookings(data);
    } catch (e) {
      console.error('Failed to refresh bookings', e);
    }
  }

  async function updateStatus(id: string, status: 'Confirmed' | 'Pending' | 'Cancelled') {
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }
      // Optimistic update
      setBookings((prev) => prev ? prev.map(b => b.id === id ? { ...b, status } : b) : prev);
      toast({ title: 'Booking updated', description: `Status set to ${status}.` });
    } catch (e: any) {
      console.error('Failed to update status', e);
      toast({ title: 'Update failed', description: e?.message || 'Could not update booking', variant: 'destructive' });
    }
  }

  function openEdit(b: BookingRow) {
    setEditing(b);
    setForm({
      status: b.status ?? 'Pending',
      paymentStatus: b.paymentStatus ?? 'Pending',
      travelDate: b.travelDate ?? '',
      numberOfTravelers: b.numberOfTravelers ?? 1,
    });
    setEditOpen(true);
  }

  async function submitEdit() {
    if (!editing) return;
    try {
      const payload: any = { id: editing.id };
      if (form.status) payload.status = form.status;
      if (form.paymentStatus) payload.paymentStatus = form.paymentStatus;
      if (form.travelDate) payload.travelDate = form.travelDate;
      if (form.numberOfTravelers) payload.numberOfTravelers = form.numberOfTravelers;
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }
      // Update local list
      setBookings(prev => prev ? prev.map(b => b.id === editing.id ? {
        ...b,
        status: form.status || b.status,
        paymentStatus: form.paymentStatus || b.paymentStatus,
        travelDate: form.travelDate || b.travelDate,
        numberOfTravelers: form.numberOfTravelers || b.numberOfTravelers,
      } : b) : prev);
      setEditOpen(false);
      toast({ title: 'Booking updated', description: 'Changes saved.' });
    } catch (e: any) {
      console.error('Failed to save booking', e);
      toast({ title: 'Save failed', description: e?.message || 'Could not save changes', variant: 'destructive' });
    }
  }

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/bookings');
        const data = await res.json();
        if (mounted) setBookings(data);
      } catch (e) {
        console.error('Failed to load bookings', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="all">
        <Card>
          <CardHeader>
            <CardTitle>Bookings Management</CardTitle>
            <CardDescription>
              View and manage all room and worker bookings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer / Worker</TableHead>
                  <TableHead>Property / Room</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                   <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Loading bookings...</TableCell>
                  </TableRow>
                )}
                {bookings && bookings.map(booking => (
                    <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.customerName}</TableCell>
                    <TableCell>{booking.serviceTitle}</TableCell>
                    <TableCell>
                      <Badge variant={booking.status === 'Confirmed' ? 'default' : booking.status === 'Pending' ? 'secondary' : 'destructive'}>{booking.status}</Badge>
                    </TableCell>
                    <TableCell>{booking.bookingDate}</TableCell>
            <TableCell className="text-right">£{booking.totalPrice?.toFixed(2)}</TableCell>
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
                                <DropdownMenuItem onClick={() => updateStatus(booking.id, 'Confirmed')}>Confirm Booking</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => updateStatus(booking.id, 'Cancelled')}>Cancel Booking</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => openEdit(booking)}>Edit Booking</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payment Status</Label>
                <Input value={form.paymentStatus} onChange={(e) => setForm(f => ({ ...f, paymentStatus: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Travel Date</Label>
                <Input type="date" value={form.travelDate} onChange={(e) => setForm(f => ({ ...f, travelDate: e.target.value }))} />
              </div>
              <div>
                <Label>Travelers</Label>
                <Input type="number" min={1} value={form.numberOfTravelers} onChange={(e) => setForm(f => ({ ...f, numberOfTravelers: Number.parseInt(e.target.value || '1', 10) }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={submitEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}

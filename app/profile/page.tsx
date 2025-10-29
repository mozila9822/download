"use client";

import { useEffect, useState } from "react";
import SiteLayout from "@/components/site/SiteLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type MeResponse = {
  id?: number
  firstName?: string
  lastName?: string
  email: string
  phone?: string | null
  address?: string | null
  role: 'User' | 'Admin' | 'Staff' | 'SuperAdmin' | 'master_admin'
  editable: boolean
}

type MyBookingRow = {
  id: string
  serviceTitle: string
  travelDate: string
  paymentStatus: string
  totalPrice: number
}

export default function ProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [bookings, setBookings] = useState<MyBookingRow[]>([]);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(true);

  // Editable fields
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await fetch('/api/users/me');
        if (!res.ok) {
          throw new Error(`Failed: ${res.status}`);
        }
        const data: MeResponse = await res.json();
        if (mounted) {
          setProfile(data);
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
          setPhone(data.phone || "");
          setAddress(data.address || "");
        }
      } catch (e) {
        console.warn('Failed to load profile', e);
        toast({ title: 'Failed to load profile', description: 'Please sign in to view your profile.', variant: 'destructive' });
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    };
    loadProfile();
    return () => { mounted = false; };
  }, [toast]);

  useEffect(() => {
    let mounted = true;
    const loadBookings = async () => {
      setLoadingBookings(true);
      try {
        const res = await fetch('/api/bookings/me');
        if (!res.ok) {
          throw new Error(`Failed: ${res.status}`);
        }
        const data: MyBookingRow[] = await res.json();
        if (mounted) setBookings(data);
      } catch (e) {
        console.warn('Failed to load bookings', e);
        // Do not toast loudly; show empty list instead.
      } finally {
        if (mounted) setLoadingBookings(false);
      }
    };
    loadBookings();
    return () => { mounted = false; };
  }, []);

  const onSaveProfile = async () => {
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phone, address }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'Failed to update profile');
      }
      toast({ title: 'Profile updated', description: 'Your profile information has been saved.' });
    } catch (e: any) {
      toast({ title: 'Failed to update profile', description: e?.message || String(e), variant: 'destructive' });
    }
  };

  const displayName = [firstName || profile?.firstName, lastName || profile?.lastName].filter(Boolean).join(' ') || profile?.email || 'Guest';

  return (
    <SiteLayout>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Manage your personal details and contact information.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" alt={displayName} />
                  <AvatarFallback>{(displayName || 'U').slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{displayName}</div>
                  <div className="text-sm text-muted-foreground">{profile?.email || 'Not signed in'}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Your first name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Your last name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 000 000 0000" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, City, Country" />
                </div>
              </div>

              <div className="mt-6">
                <Button onClick={onSaveProfile} disabled={!profile || !profile.editable}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
              <CardDescription>Bookings associated with your account.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingBookings ? (
                <div>Loading bookings...</div>
              ) : bookings.length === 0 ? (
                <div className="text-sm text-muted-foreground">You have no bookings yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Travel Date</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>
                          <div className="font-medium">{b.serviceTitle}</div>
                        </TableCell>
                        <TableCell>{b.travelDate}</TableCell>
                        <TableCell>
                          <Badge variant={b.paymentStatus === 'Paid' ? 'default' : 'secondary'}>
                            {b.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">${b.totalPrice.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SiteLayout>
  );
}


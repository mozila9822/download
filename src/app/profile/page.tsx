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

type MyBookingRow = {
  id: string;
  serviceTitle: string;
  travelDate: string;
  paymentStatus: string;
  totalPrice: number;
};

export default function ProfilePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const photoURL = "";
  const [bookings, setBookings] = useState<MyBookingRow[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/users/me", { cache: "no-store" });
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || `Failed to load profile (${res.status})`);
        }
        const data = await res.json();
        if (!mounted) return;
        setEmail(data.email || "");
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setCanEdit(Boolean(data.editable));
      } catch (e: any) {
        setError(e?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setBookingsLoading(true);
        const res = await fetch("/api/bookings/me", { cache: "no-store" });
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || `Failed to load bookings (${res.status})`);
        }
        const data = await res.json();
        if (!mounted) return;
        setBookings(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) setBookings([]);
      } finally {
        if (mounted) setBookingsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSave() {
    if (!isEditing || !canEdit) return;
    try {
      setSaving(true);
      setError(null);
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone, address }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Failed to save profile (${res.status})`);
      }
      const data = await res.json();
      setFirstName(data.firstName || "");
      setLastName(data.lastName || "");
      setPhone(data.phone || "");
      setAddress(data.address || "");
      setIsEditing(false);
      toast({ title: "Saved", description: "Profile updated successfully." });
    } catch (e: any) {
      setError(e?.message || "Failed to save changes.");
      toast({ title: "Error", description: e?.message || "Failed to save changes.", variant: "destructive" as any });
    } finally {
      setSaving(false);
    }
  }

  return (
    <SiteLayout>
      <div className="container py-12 md:py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="items-center text-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={photoURL} />
                  <AvatarFallback>
                    {(firstName || "").charAt(0)}
                    {(lastName || "").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>
                  {firstName || "—"} {lastName || ""}
                </CardTitle>
                <CardDescription>{email || ""}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  disabled={!canEdit || loading}
                  onClick={() => setIsEditing(true)}
                >
                  {canEdit ? "Edit Profile" : "Editing Disabled"}
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2 space-y-8">
            <Card>
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
              <CardDescription>
                A list of your past and upcoming trips.
              </CardDescription>
            </CardHeader>
            <CardContent>
                {bookingsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading bookings…</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">
                            {booking.serviceTitle}
                          </TableCell>
                          <TableCell>{booking.travelDate}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                ["paid", "completed", "success"].includes(
                                  String(booking.paymentStatus).toLowerCase()
                                )
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {booking.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            ${booking.totalPrice?.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {bookings.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            You have no bookings yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
            </CardContent>
          </Card>
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Manage your personal and payment details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                {loading && (
                  <p className="text-sm text-muted-foreground">Loading profile…</p>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      disabled={!isEditing || saving || loading}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      disabled={!isEditing || saving || loading}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    disabled={!isEditing || saving || loading}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={address}
                    disabled={!isEditing || saving || loading}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleSave}
                    disabled={!isEditing || saving || loading}
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
// Switch from Firestore seeding to Prisma via admin API endpoints

export default function SeedDbPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [isClearing, setIsClearing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleSeed = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Seeding failed');
      toast({ title: 'Database Seeded', description: `Created users: ${data.created?.users}, services: ${data.created?.services}, bookings: ${data.created?.bookings}` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error Seeding Database', description: error.message });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    setIsClearing(true);
    try {
      const res = await fetch('/api/admin/db-clear', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Clearing failed');
      toast({ title: 'Database Cleared', description: `Deleted bookings: ${data.deleted?.bookings}, services: ${data.deleted?.services}` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error Clearing Database', description: error.message });
      console.error(error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleImportServices = async () => {
    setIsImporting(true);
    try {
      const res = await fetch('/api/services/import', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Import failed');
      toast({ title: 'Services Imported', description: `Created: ${data.created}, skipped: ${data.skipped}` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error Importing Services', description: error.message });
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seed Database (Prisma)</CardTitle>
        <CardDescription>
          Populate your MySQL/MariaDB database with initial mock data (services, a demo user, and a sample booking). Requires admin session.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-start gap-4">
          <p className="text-sm text-muted-foreground">
            Use the buttons below to seed or clear data. Seeding is idempotent and only inserts data if none exists.
          </p>
          <Button onClick={handleSeed} disabled={isLoading}>
            {isLoading ? 'Seeding...' : 'Seed Database'}
          </Button>
          <Button onClick={handleImportServices} variant="secondary" disabled={isImporting}>
            {isImporting ? 'Importing...' : 'Import Fallback Services'}
          </Button>
          <Button onClick={handleClear} variant="outline" disabled={isClearing}>
            {isClearing ? 'Clearing...' : 'Clear Services & Bookings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

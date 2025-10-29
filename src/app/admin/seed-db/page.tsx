'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { seedDatabase } from '@/lib/seed-db';
import { useAuth, useFirestore } from '@/firebase';

export default function SeedDbPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();

  const handleSeed = async () => {
    setIsLoading(true);
    try {
      await seedDatabase(firestore, auth);
      toast({
        title: 'Database Seeded',
        description: 'Mock data and admin user have been added to Firestore.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Seeding Database',
        description: error.message,
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seed Database</CardTitle>
        <CardDescription>
          Populate your Firestore database with the initial mock data. This will create collections for services, properties, and users, including an admin account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-start gap-4">
          <p className="text-sm text-muted-foreground">
            Click the button below to start the seeding process. This should only be done once.
          </p>
          <Button onClick={handleSeed} disabled={isLoading}>
            {isLoading ? 'Seeding...' : 'Seed Database'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import type { Service } from '@/lib/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type ServiceCardProps = {
  service: Service;
};

export default function ServiceCard({ service }: ServiceCardProps) {
  const hasOffer = service.offerPrice && service.offerPrice < service.price;
  const [isOpen, setIsOpen] = useState(false);
  const [travelDate, setTravelDate] = useState('');
  const [travelers, setTravelers] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const basePrice = hasOffer ? service.offerPrice! : service.price;
  const totalPrice = basePrice * (Number.isFinite(travelers) ? travelers : 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!travelDate || !travelers || travelers < 1) {
      toast({ variant: 'destructive', title: 'Invalid details', description: 'Please provide travel date and travelers.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          travelDate,
          numberOfTravelers: travelers,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        const msg = data?.error || 'Failed to create booking.';
        toast({ variant: 'destructive', title: 'Error', description: msg });
        return;
      }
      toast({ title: 'Booked!', description: 'Your booking has been created.' });
      setIsOpen(false);
      setTravelDate('');
      setTravelers(1);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err?.message || 'Something went wrong.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
      <CardHeader className="p-0 relative">
        <div className="relative aspect-video">
          <Image
            src={service.imageUrl}
            alt={service.title}
            fill
            className="object-cover"
          />
        </div>
        {hasOffer && (
          <Badge variant="destructive" className="absolute top-3 right-3 text-base">
            DEAL!
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-1 pt-6">
        <CardTitle className="font-headline text-xl leading-snug group-hover:text-primary transition-colors">
          {service.title}
        </CardTitle>
        <div className="mt-2 flex items-center text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mr-1.5" />
          <span>{service.location}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className='flex flex-col items-start'>
            {hasOffer ? (
                <>
                    <p className="text-sm text-muted-foreground line-through">
                        ${service.price.toLocaleString()}
                    </p>
                    <p className="text-lg font-bold text-destructive">
                        ${service.offerPrice?.toLocaleString()}
                    </p>
                </>
            ) : (
                <p className="text-lg font-bold text-primary">
                    ${service.price.toLocaleString()}
                </p>
            )}
        </div>
        <Button onClick={() => setIsOpen(true)}>Book Now</Button>
      </CardFooter>
    </Card>
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book: {service.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="travel-date">Travel Date</Label>
            <Input id="travel-date" type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="travelers">Number of Travelers</Label>
            <Input id="travelers" type="number" min={1} value={travelers} onChange={(e) => setTravelers(Math.max(1, Number.parseInt(e.target.value || '1', 10)))} required />
          </div>
          <div className="text-sm text-muted-foreground">Total: ${totalPrice.toLocaleString()}</div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Booking…' : 'Confirm Booking'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}

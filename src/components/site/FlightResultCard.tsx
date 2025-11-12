"use client";
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export type FlightOption = {
  id: string
  airline: string
  flightNumber: string
  origin: { code: string; city?: string; country: string }
  destination: { code: string; city?: string; country: string }
  departTime: string
  arriveTime: string
  durationMinutes: number
  stops: number
  cabin: 'economy' | 'premium' | 'business' | 'first'
  price: number
  currency: string
  seatsAvailable: number
}

function formatTimeRange(depIso: string, arrIso: string): string {
  const dep = new Date(depIso)
  const arr = new Date(arrIso)
  const d = `${dep.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  const a = `${arr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  const day = dep.toLocaleDateString()
  return `${day} • ${d} → ${a}`
}

function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h ${m}m`
}

type Props = { flight: FlightOption }

export default function FlightResultCard({ flight }: Props) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [travelers, setTravelers] = useState(1)
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalPrice = Math.round((Number.isFinite(flight.price) ? flight.price : 0) * (Number.isFinite(travelers) ? travelers : 1))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!contactName.trim() || !contactEmail.trim()) {
      toast({ variant: 'destructive', title: 'Missing contact', description: 'Please provide your name and email.' })
      return
    }
    if (!Number.isFinite(travelers) || travelers <= 0) {
      toast({ variant: 'destructive', title: 'Invalid travelers', description: 'Please provide a valid number of travelers.' })
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/flights/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flight: {
            originCode: flight.origin.code,
            destinationCode: flight.destination.code,
            airline: flight.airline,
            flightNumber: flight.flightNumber,
            departTime: flight.departTime,
            arriveTime: flight.arriveTime,
            cabin: flight.cabin,
            price: flight.price,
            currency: flight.currency,
          },
          travelers,
          contactName,
          contactEmail,
          contactPhone: contactPhone || undefined,
          notes: notes || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        const msg = data?.error || 'Failed to create booking.'
        toast({ variant: 'destructive', title: 'Error', description: msg })
        return
      }
      if (data?.bookingId && data?.next) {
        const pRes = await fetch(String(data.next), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: String(data.bookingId) }),
        })
        const p = await pRes.json().catch(() => ({}))
        if (!pRes.ok || !p?.ok) {
          const msg = p?.error || 'Payment failed.'
          toast({ variant: 'destructive', title: 'Payment error', description: msg })
          return
        }
        toast({ title: 'Payment complete', description: 'Your booking is confirmed.' })
      } else {
        toast({ title: 'Booked!', description: 'Your booking has been created. Complete payment from your bookings page.' })
      }
      setIsOpen(false)
      setTravelers(1)
      setContactName('')
      setContactEmail('')
      setContactPhone('')
      setNotes('')
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err?.message || 'Something went wrong.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="font-headline text-lg">{flight.airline} {flight.flightNumber}</span>
            {flight.seatsAvailable < 5 ? (
              <Badge variant="destructive">{flight.seatsAvailable} left</Badge>
            ) : (
              <Badge variant="secondary">{flight.seatsAvailable} seats</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>{flight.origin.code} → {flight.destination.code}</span>
            <span className="font-medium text-white">£{flight.price.toLocaleString()}</span>
          </div>
          <div>{formatTimeRange(flight.departTime, flight.arriveTime)}</div>
          <div className="flex items-center justify-between">
            <span>{formatDuration(flight.durationMinutes)} • {flight.stops ? `${flight.stops} stop` : 'Nonstop'}</span>
            <span className="capitalize">{flight.cabin}</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={() => setIsOpen(true)}>Book</Button>
        </CardFooter>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book {flight.airline} {flight.flightNumber}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="travelers">Travelers</Label>
              <Input id="travelers" type="number" min={1} value={travelers} onChange={(e) => setTravelers(Math.max(1, parseInt(e.target.value || '1', 10)))} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact-name">Contact Name</Label>
              <Input id="contact-name" value={contactName} onChange={(e) => setContactName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact-email">Contact Email</Label>
              <Input id="contact-email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact-phone">Contact Phone</Label>
              <Input id="contact-phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Special requests, preferences, etc." />
            </div>
            <div className="text-sm text-muted-foreground">Total: £{totalPrice.toLocaleString()}</div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Booking…' : 'Confirm Booking'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

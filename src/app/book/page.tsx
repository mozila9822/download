"use client"

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import Footer from '@/components/site/Footer'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from '@/components/ui/carousel'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import Link from 'next/link'
import { PlaneTakeoff } from 'lucide-react'
import { useSettings } from '@/hooks/use-settings'

type Service = {
  id: string
  category: string
  title: string
  description: string
  price: number
  offerPrice?: number
  location: string
  imageUrl: string
}

type AvailabilitySlot = { start: string; end: string; available: boolean }

export default function BookPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { settings } = useSettings()
  const [services, setServices] = useState<Service[]>([])
  const [serviceId, setServiceId] = useState<string>('')
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0])
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [selectedSlotIso, setSelectedSlotIso] = useState<string>('')
  const [travelers, setTravelers] = useState<number>(1)
  const [contactName, setContactName] = useState<string>('')
  const [contactEmail, setContactEmail] = useState<string>('')
  const [contactPhone, setContactPhone] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  // Category-specific fields
  const [cbNights, setCbNights] = useState<number>(3)
  const [cbAccommodation, setCbAccommodation] = useState<string>('standard')
  const [cbDepartureCity, setCbDepartureCity] = useState<string>('')

  const [tourGuideLanguage, setTourGuideLanguage] = useState<string>('English')
  const [tourFitnessLevel, setTourFitnessLevel] = useState<string>('easy')
  const [tourPickupRequired, setTourPickupRequired] = useState<boolean>(false)

  const [hotelRoomType, setHotelRoomType] = useState<string>('standard')
  const [hotelRooms, setHotelRooms] = useState<number>(1)
  const [hotelBedPref, setHotelBedPref] = useState<string>('any')

  const [coachPickup, setCoachPickup] = useState<string>('')
  const [coachDropoff, setCoachDropoff] = useState<string>('')
  const [coachSeatType, setCoachSeatType] = useState<string>('standard')
  const [creating, setCreating] = useState<boolean>(false)
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null)
  const [provider, setProvider] = useState<'stripe' | 'mock' | null>(null)
  const [auth, setAuth] = useState<{ email: string; role: string; isAdmin: boolean } | null>(null)
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null)

  const selectedService = useMemo(() => services.find((s) => s.id === serviceId) || null, [services, serviceId])
  const basePrice = useMemo(() => {
    if (!selectedService) return 0
    return Number.isFinite(selectedService.offerPrice ?? NaN) && selectedService.offerPrice
      ? Number(selectedService.offerPrice)
      : Number(selectedService.price)
  }, [selectedService])
  const serviceCategories = useMemo(() => (settings?.sections ?? []).filter((s) => s.visible), [settings])
  const navLinks = useMemo(() => (settings?.navigation ?? []).filter((n) => n.visible), [settings])
  const title = settings?.siteTitle || 'VoyagerHub'
  const logoUrl = settings?.logoUrl || null

  useEffect(() => {
    // Load auth session for Admin/Sign Out controls
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/session', { method: 'GET' });
        if (!res.ok) {
          if (!cancelled) setAuth(null);
        } else {
          const data = await res.json().catch(() => ({}));
          if (data?.authenticated && data?.user) {
            if (!cancelled) setAuth({ email: data.user.email, role: data.user.role, isAdmin: !!data.user.isAdmin });
          } else {
            if (!cancelled) setAuth(null);
          }
        }
      } catch {
        if (!cancelled) setAuth(null);
      }
    })();
    return () => { cancelled = true };
  }, [])

  useEffect(() => {
    // Auto-advance carousel every 5 seconds (slow movement)
    if (!carouselApi) return;
    const id = setInterval(() => {
      try {
        carouselApi.scrollNext();
      } catch {}
    }, 5000);
    return () => clearInterval(id);
  }, [carouselApi])
  
  useEffect(() => {
    let mounted = true
    const loadServices = async () => {
      try {
        const res = await fetch('/api/services')
        const data = await res.json()
        if (mounted && Array.isArray(data)) {
          setServices(data)
          const preselect = searchParams.get('serviceId')
          if (preselect && data.find((s: Service) => s.id === preselect)) {
            setServiceId(preselect)
          } else if (!serviceId && data.length > 0) {
            setServiceId(data[0].id)
          }
          const preDate = searchParams.get('date')
          if (preDate) {
            try {
              const d = new Date(preDate)
              if (!Number.isNaN(d.getTime())) setDate(d.toISOString().split('T')[0])
            } catch {}
          }
        }
      } catch (e) {
        console.error('Failed to load services', e)
      }
    }
    loadServices()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const loadSlots = async () => {
      setSlots([])
      setSelectedSlotIso('')
      if (!serviceId || !date) return
      try {
        const res = await fetch(`/api/services/${serviceId}/availability?date=${encodeURIComponent(date)}`, { cache: 'no-store' })
        const data = await res.json()
        if (data?.ok && Array.isArray(data.slots)) {
          setSlots(data.slots)
        } else {
          setSlots([])
        }
      } catch (e) {
        setSlots([])
      }
    }
    loadSlots()
  }, [serviceId, date])

  const handleCreate = async () => {
    try {
      setCreating(true)
      setCreatedBookingId(null)
      setProvider(null)
      // Base validations
      if (!serviceId || !selectedSlotIso || !contactName || !contactEmail || travelers <= 0) {
        toast({ title: 'Missing details', description: 'Please select a slot and fill contact info.', variant: 'destructive' as any })
        return
      }
      // Category-specific validations
      const cat = selectedService?.category || ''
      if (cat === 'City Break') {
        if (!cbNights || cbNights <= 0 || !cbDepartureCity.trim()) {
          toast({ title: 'More details needed', description: 'Please add nights and departure city for City Break.', variant: 'destructive' as any })
          return
        }
      } else if (cat === 'Tour') {
        if (!tourGuideLanguage.trim()) {
          toast({ title: 'More details needed', description: 'Please choose a guide language for the Tour.', variant: 'destructive' as any })
          return
        }
      } else if (cat === 'Hotel') {
        if (!hotelRoomType.trim() || !hotelRooms || hotelRooms <= 0) {
          toast({ title: 'More details needed', description: 'Please choose room type and number of rooms for the Hotel.', variant: 'destructive' as any })
          return
        }
      } else if (cat === 'Coach Ride') {
        if (!coachPickup.trim() || !coachDropoff.trim()) {
          toast({ title: 'More details needed', description: 'Please add pickup and dropoff points for the Coach Ride.', variant: 'destructive' as any })
          return
        }
      }

      // Build a readable summary to append to notes
      const extrasSummary = (() => {
        if (cat === 'City Break') {
          return `CityBreak: nights=${cbNights}; accommodation=${cbAccommodation}; departure=${cbDepartureCity}`
        }
        if (cat === 'Tour') {
          return `Tour: guideLanguage=${tourGuideLanguage}; fitness=${tourFitnessLevel}; pickupRequired=${tourPickupRequired ? 'yes' : 'no'}`
        }
        if (cat === 'Hotel') {
          return `Hotel: roomType=${hotelRoomType}; rooms=${hotelRooms}; bedPreference=${hotelBedPref}`
        }
        if (cat === 'Coach Ride') {
          return `CoachRide: pickup=${coachPickup}; dropoff=${coachDropoff}; seatType=${coachSeatType}`
        }
        return ''
      })()
      const notesFinal = [notes.trim(), extrasSummary].filter(Boolean).join(' | ')
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          travelDate: selectedSlotIso,
          numberOfTravelers: travelers,
          contactName,
          contactEmail,
          contactPhone,
          notes: notesFinal,
          paymentStatus: 'Pending',
          currency: 'gbp',
          // Provide extras for future persistence even if ignored today
          extras: {
            category: cat,
            cityBreak: cat === 'City Break' ? { nights: cbNights, accommodation: cbAccommodation, departureCity: cbDepartureCity } : undefined,
            tour: cat === 'Tour' ? { guideLanguage: tourGuideLanguage, fitness: tourFitnessLevel, pickupRequired: tourPickupRequired } : undefined,
            hotel: cat === 'Hotel' ? { roomType: hotelRoomType, rooms: hotelRooms, bedPreference: hotelBedPref } : undefined,
            coachRide: cat === 'Coach Ride' ? { pickup: coachPickup, dropoff: coachDropoff, seatType: coachSeatType } : undefined,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || `Failed to create booking (${res.status})`)
      }
      setCreatedBookingId(String(data.id))
      // Detect provider so UI can route to checkout
      const stripeSecret = (process.env.NEXT_PUBLIC_STRIPE_ENABLED || '').toLowerCase() === 'true'
      setProvider(stripeSecret ? 'stripe' : 'mock')
      toast({ title: 'Booking created', description: 'Proceed to payment to confirm your booking.' })
      // Redirect to profile page to meet requirement
      router.push('/profile')
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Unable to create booking.', variant: 'destructive' as any })
    } finally {
      setCreating(false)
    }
  }

  const handleCheckout = async () => {
    if (!createdBookingId) return
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: createdBookingId }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data?.error || `Checkout failed (${res.status})`)
      if (data.provider === 'stripe' && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }
      toast({ title: 'Payment successful', description: 'Your booking is confirmed.' })
    } catch (e: any) {
      toast({ title: 'Payment error', description: e?.message || 'Unable to process payment.', variant: 'destructive' as any })
    }
  }

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    window.location.href = '/'
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-primary/50 via-primary/45 to-accent/60 text-white">
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden">
        {/* Top overlay with logo/menu and auth buttons */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="mr-2 flex items-center space-x-2 text-white">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={title} className="h-6 w-6 object-contain" />
              ) : (
                <PlaneTakeoff className="h-6 w-6 text-primary" />
              )}
              <span className="font-bold font-headline text-lg text-white">{title}</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              {serviceCategories.map(({ href, name }) => (
                <Link
                  key={href + name}
                  href={href}
                  className="transition-colors text-white hover:text-accent"
                >
                  {name}
                </Link>
              ))}
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="transition-colors text-white hover:text-accent"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <nav className="flex md:hidden items-center gap-2 overflow-x-auto">
              {serviceCategories.map(({ href, name }) => (
                <Link
                  key={href + name}
                  href={href}
                  className="px-2 py-1 rounded-md transition-colors text-white/90 hover:text-white whitespace-nowrap"
                >
                  {name}
                </Link>
              ))}
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-2 py-1 rounded-md transition-colors text-white/90 hover:text-white whitespace-nowrap"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {!auth && (
              <>
                <Link href="/auth/signin" className="transition-colors text-white hover:text-accent">Sign In</Link>
                <Link href="/auth/signup" className="transition-colors text-white hover:text-accent">Sign Up</Link>
              </>
            )}
            {auth && (
              <>
                {auth.isAdmin && (
                  <Link href="/admin/workers" className="transition-colors text-white hover:text-accent">Admin</Link>
                )}
                <Link href="/profile" className="transition-colors text-white hover:text-accent">Profile</Link>
                <button onClick={signOut} className="transition-colors text-white hover:text-accent">Sign Out</button>
              </>
            )}
          </div>
        </div>
        {/* Top Carousel */}
        <section className="relative z-10 container px-4 md:px-6 py-8 md:py-12">
          <div className="group relative overflow-hidden rounded-2xl">
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary/70 to-accent/80 blur opacity-30" />
            <div className="relative rounded-2xl p-4 md:p-6 bg-black/40 backdrop-blur-lg border border-white/15">
              <Carousel opts={{ align: 'start', loop: true, speed: 2 }} setApi={setCarouselApi}>
                <CarouselContent>
                  {(PlaceHolderImages.slice(0, 6)).map((img) => (
                    <CarouselItem key={img.id} className="md:basis-1/2 lg:basis-1/3">
                      <div className="relative overflow-hidden rounded-xl">
                        <Image src={img.imageUrl} alt={img.description ?? 'Slide'} width={1200} height={800} className="h-56 md:h-72 w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        <div className="absolute bottom-3 left-3 text-white">
                          <div className="text-sm font-medium">{img.description ?? 'Explore more'}</div>
                          <div className="text-xs text-white/80">{img.imageHint}</div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious aria-label="Previous" />
                <CarouselNext aria-label="Next" />
              </Carousel>
            </div>
          </div>
        </section>

        {/* Booking Form */}
        <section className="relative z-10 container px-4 md:px-6 pb-12">
          <Card className="bg-black/40 backdrop-blur-lg border border-white/15">
            <CardHeader>
              <CardTitle className="font-headline">Book a Service</CardTitle>
              <CardDescription className="text-primary/80">Select a service, date, time, and provide your details.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label className="text-primary">Service</Label>
                    <Select value={serviceId} onValueChange={setServiceId}>
                      <SelectTrigger className="mt-1 bg-black/30 border border-white/15 text-white">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.title} · £{(s.offerPrice ?? s.price).toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-primary">Date</Label>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 bg-black/30 border border-white/15 text-white" />
                  </div>

                  <div>
                    <Label className="text-primary">Available Time Slots</Label>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                      {slots.length === 0 && (
                        <p className="text-sm text-primary/80">No slots available for selected date.</p>
                      )}
                      {slots.map((slot) => {
                        const startLocal = new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        const endLocal = new Date(slot.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        const isSelected = selectedSlotIso === slot.start
                        return (
                          <Button
                            key={slot.start}
                            variant={isSelected ? 'default' : slot.available ? 'outline' : 'secondary'}
                            disabled={!slot.available}
                            onClick={() => setSelectedSlotIso(slot.start)}
                            className={(isSelected ? 'rounded-xl' : 'rounded-xl bg-black/30 border border-white/15 text-white')}
                          >
                            {startLocal} - {endLocal}
                            {!slot.available && <Badge className="ml-2" variant="destructive">Booked</Badge>}
                          </Button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-primary">Travelers</Label>
                      <Input type="number" min={1} value={travelers} onChange={(e) => setTravelers(Math.max(1, Number(e.target.value || 1)))} className="mt-1 bg-black/30 border border-white/15 text-white" />
                    </div>
                    <div className="flex items-end">
                      <div className="text-sm text-primary/80">Total: £{(basePrice * travelers).toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-primary">Contact Name</Label>
                    <Input value={contactName} onChange={(e) => setContactName(e.target.value)} className="mt-1 bg-black/30 border border-white/15 text-white" />
                  </div>
                  <div>
                    <Label className="text-primary">Contact Email</Label>
                    <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="mt-1 bg-black/30 border border-white/15 text-white" />
                  </div>
                  <div>
                    <Label className="text-primary">Contact Phone</Label>
                    <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="mt-1 bg-black/30 border border-white/15 text-white" />
                  </div>
                  <div>
                    <Label className="text-primary">Notes</Label>
                    <Input value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 bg-black/30 border border-white/15 text-white" />
                  </div>

                  {/* Category-specific fields */}
                  {selectedService?.category === 'City Break' && (
                    <div className="mt-4 space-y-3">
                      <div className="text-sm font-medium text-primary">City Break Details</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-primary">Nights</Label>
                          <Input type="number" min={1} value={cbNights} onChange={(e) => setCbNights(Math.max(1, Number(e.target.value || 1)))} className="mt-1 bg-black/30 border border-white/15 text-white" />
                        </div>
                        <div>
                          <Label className="text-primary">Accommodation</Label>
                          <Select value={cbAccommodation} onValueChange={setCbAccommodation}>
                            <SelectTrigger className="mt-1 bg-black/30 border border-white/15 text-white">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard (3★)</SelectItem>
                              <SelectItem value="deluxe">Deluxe (4★)</SelectItem>
                              <SelectItem value="luxury">Luxury (5★)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-primary">Departure City</Label>
                        <Input value={cbDepartureCity} onChange={(e) => setCbDepartureCity(e.target.value)} className="mt-1 bg-black/30 border border-white/15 text-white" />
                      </div>
                    </div>
                  )}

                  {selectedService?.category === 'Tour' && (
                    <div className="mt-4 space-y-3">
                      <div className="text-sm font-medium text-primary">Tour Details</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-primary">Guide Language</Label>
                          <Select value={tourGuideLanguage} onValueChange={setTourGuideLanguage}>
                            <SelectTrigger className="mt-1 bg-black/30 border border-white/15 text-white">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="English">English</SelectItem>
                              <SelectItem value="Spanish">Spanish</SelectItem>
                              <SelectItem value="French">French</SelectItem>
                              <SelectItem value="German">German</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-primary">Fitness Level</Label>
                          <Select value={tourFitnessLevel} onValueChange={setTourFitnessLevel}>
                            <SelectTrigger className="mt-1 bg-black/30 border border-white/15 text-white">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="challenging">Challenging</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input id="tour-pickup" type="checkbox" checked={tourPickupRequired} onChange={(e) => setTourPickupRequired(e.target.checked)} className="h-4 w-4" />
                        <Label htmlFor="tour-pickup" className="text-primary">Hotel pickup required</Label>
                      </div>
                    </div>
                  )}

                  {selectedService?.category === 'Hotel' && (
                    <div className="mt-4 space-y-3">
                      <div className="text-sm font-medium text-primary">Hotel Details</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-primary">Room Type</Label>
                          <Select value={hotelRoomType} onValueChange={setHotelRoomType}>
                            <SelectTrigger className="mt-1 bg-black/30 border border-white/15 text-white">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="suite">Suite</SelectItem>
                              <SelectItem value="family">Family</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-primary">Rooms</Label>
                          <Input type="number" min={1} value={hotelRooms} onChange={(e) => setHotelRooms(Math.max(1, Number(e.target.value || 1)))} className="mt-1 bg-black/30 border border-white/15 text-white" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-primary">Bed Preference</Label>
                        <Select value={hotelBedPref} onValueChange={setHotelBedPref}>
                          <SelectTrigger className="mt-1 bg-black/30 border border-white/15 text-white">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="double">Double</SelectItem>
                            <SelectItem value="twin">Twin</SelectItem>
                            <SelectItem value="king">King</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {selectedService?.category === 'Coach Ride' && (
                    <div className="mt-4 space-y-3">
                      <div className="text-sm font-medium text-primary">Coach Ride Details</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-primary">Pickup Point</Label>
                          <Input value={coachPickup} onChange={(e) => setCoachPickup(e.target.value)} className="mt-1 bg-black/30 border border-white/15 text-white" />
                        </div>
                        <div>
                          <Label className="text-primary">Dropoff Point</Label>
                          <Input value={coachDropoff} onChange={(e) => setCoachDropoff(e.target.value)} className="mt-1 bg-black/30 border border-white/15 text-white" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-primary">Seat Type</Label>
                        <Select value={coachSeatType} onValueChange={setCoachSeatType}>
                          <SelectTrigger className="mt-1 bg-black/30 border border-white/15 text-white">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="vip">VIP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button className="rounded-xl" onClick={handleCreate} disabled={creating || !serviceId || !selectedSlotIso}>Create Booking</Button>
                    <Button className="rounded-xl" onClick={handleCheckout} disabled={!createdBookingId}>Proceed to Payment</Button>
                  </div>
                  {provider === 'stripe' && (
                <p className="text-sm text-muted-foreground">Payment handled by Stripe. You will be redirected.</p>
              )}
              {provider === 'mock' && (
                <p className="text-sm text-muted-foreground">Mock payment will auto-confirm the booking.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
    {/* Themed CTA */}
    <section className="relative z-10 px-4 md:px-6 pb-12">
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/15 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 p-8 text-center">
        <h2 className="text-2xl font-bold md:text-3xl">Need help planning your trip?</h2>
        <p className="mt-2 text-white/80">Our travel experts can tailor a perfect itinerary for you.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button asChild size="lg" className="rounded-xl">
            <Link href="/tours/landing">Explore Deals</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-xl">
            <Link href="/services">Ask a Planner</Link>
          </Button>
        </div>
      </div>
    </section>
    </main>
    <Footer />
  </div>
  )
}

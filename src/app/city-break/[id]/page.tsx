'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Card, CardContent } from '@/components/ui/card'
// Switched from Firebase to API-backed data fetching
import { Clock, Calendar, MapPin, Star, Plane, Hotel, Sparkles, Images } from 'lucide-react'

type Testimonial = { name: string; quote: string; photoUrl?: string }
type FaqItem = { question: string; answer: string }
type CityBreakDetail = {
  name?: string
  location: string
  country?: string
  tagline?: string
  description?: string
  duration?: string
  bestSeason?: string
  activityType?: string
  price: number
  offerPrice?: number
  imageUrl: string
  status?: 'Active' | 'Inactive'
  popularity?: number
  // 3. Highlights
  highlights?: string[]
  // 4. Travel Details
  datesAvailable?: string[]
  flexibleDates?: boolean
  departureCities?: string[]
  inclusions?: string[]
  exclusions?: string[]
  // 5. Accommodation
  hotelName?: string
  hotelStars?: number
  hotelDescription?: string
  hotelGallery?: string[]
  // 7. Gallery
  gallery?: string[]
  // 8. Testimonials
  testimonials?: Testimonial[]
  // 9. Related Packages - IDs of other city breaks
  relatedIds?: string[]
  // 10. FAQ
  faq?: FaqItem[]
}

type WithId<T> = T & { id: string }

export default function CityBreakDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id as string

  type ServiceDto = {
    id: string
    category: string
    title: string
    description: string
    price: number
    offerPrice?: number
    location: string
    imageUrl: string
  }

  const fromService = (s: ServiceDto): WithId<CityBreakDetail> => ({
    id: s.id,
    name: s.title,
    location: s.location,
    country: '',
    tagline: '',
    description: s.description || '',
    duration: '',
    bestSeason: '',
    activityType: '',
    price: Number(s.price || 0),
    offerPrice: s.offerPrice,
    imageUrl: s.imageUrl || 'https://picsum.photos/seed/city-hero/2400/1200',
    status: 'Active',
    popularity: 0,
    highlights: [],
    datesAvailable: [],
    flexibleDates: false,
    departureCities: [],
    inclusions: [],
    exclusions: [],
    hotelName: '',
    hotelStars: undefined,
    hotelDescription: '',
    hotelGallery: [],
    gallery: [],
    testimonials: [],
    relatedIds: [],
    faq: [],
  })

  const [data, setData] = useState<WithId<CityBreakDetail> | null>(null)
  const [allCityBreaks, setAllCityBreaks] = useState<WithId<CityBreakDetail>[]>([])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        if (!id) return
        const res = await fetch(`/api/services/${encodeURIComponent(id)}`)
        const json = await res.json().catch(() => ({}))
        if (res.ok && json?.ok && json.service) {
          const row = fromService(json.service as ServiceDto)
          if (mounted) setData(row)
        } else {
          if (mounted) setData(null)
        }
      } catch {
        if (mounted) setData(null)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  useEffect(() => {
    let mounted = true
    const loadAll = async () => {
      try {
        const res = await fetch('/api/services?category=City%20Break&limit=50')
        const arr = await res.json().catch(() => [])
        if (mounted && Array.isArray(arr)) {
          setAllCityBreaks(arr.map((s: ServiceDto) => fromService(s)))
        }
      } catch {
        // ignore
      }
    }
    loadAll()
    return () => { mounted = false }
  }, [])

  const cb: WithId<CityBreakDetail> | null = useMemo(() => {
    if (data) return data as WithId<CityBreakDetail>
    return null
  }, [data])

  const related: WithId<CityBreakDetail>[] = useMemo(() => {
    const others = (allCityBreaks ?? []).filter((c) => c.id !== id)
    if (cb?.relatedIds?.length) {
      const indexById = new Map(others.map((o) => [o.id, o]))
      return cb.relatedIds.map((rid) => indexById.get(rid)).filter(Boolean) as WithId<CityBreakDetail>[]
    }
    return others.slice(0, 4) as WithId<CityBreakDetail>[]
  }, [allCityBreaks, cb?.relatedIds, id])

  // Graceful defaults
  const title = cb?.name || `${cb?.location ?? ''}${cb?.country ? ', ' + cb.country : ''}` || 'City Break'
  const heroUrl = cb?.imageUrl || 'https://picsum.photos/seed/city-hero/2400/1200'
  const price = cb?.offerPrice ?? cb?.price ?? 0

  return (
    <div className="flex min-h-screen flex-col text-white">
      <Header />
      <main className="flex-1 pt-16">
        {/* 1. Hero Section */}
        <section
          className="relative -mt-16 h-[60vh] md:h-[70vh] lg:h-[75vh] w-full overflow-hidden"
          style={{ backgroundImage: `url(${heroUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-6 text-center">
            <h1 className="text-4xl font-bold md:text-6xl">{title}</h1>
            {!!cb?.tagline && <p className="mt-3 text-lg text-white/90 md:text-xl">{cb.tagline}</p>}
            <div className="mt-6 flex gap-3">
              <Button asChild size="lg" className="rounded-xl">
                <a href={`/book?serviceId=${id}`}>Enquire Now</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <a href={`/book?serviceId=${id}`}>View Details</a>
              </Button>
            </div>
          </div>
        </section>

        {/* 2. Overview / Intro */}
        <section id="overview" className="bg-white text-gray-900">
          <div className="mx-auto grid max-w-6xl items-start gap-8 px-6 py-12 md:grid-cols-2 md:py-16">
            <div>
              <h2 className="text-2xl font-semibold md:text-3xl">Overview</h2>
              <p className="mt-3 text-gray-700">{cb?.description ?? 'A curated city break with flexible options.'}</p>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center text-center">
                  <Clock className="h-6 w-6 text-primary" />
                  <span className="mt-1 text-sm font-medium">{cb?.duration ?? '2–5 days'}</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Calendar className="h-6 w-6 text-primary" />
                  <span className="mt-1 text-sm font-medium">{cb?.bestSeason ?? 'Any season'}</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <span className="mt-1 text-sm font-medium">{cb?.activityType ?? 'Culture / Food / Nightlife'}</span>
                </div>
              </div>
            </div>
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-2 text-gray-800">
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /><span>{cb?.location}{cb?.country ? `, ${cb.country}` : ''}</span></div>
                  <div className="flex items-center gap-2"><Hotel className="h-4 w-4 text-primary" /><span>{cb?.hotelName ?? 'Quality Hotel'}</span></div>
                  <div className="flex items-center gap-2"><Plane className="h-4 w-4 text-primary" /><span>{cb?.departureCities?.join(', ') ?? 'Multiple departure options'}</span></div>
                  <div className="flex items-center gap-2"><Star className="h-4 w-4 text-accent" /><span>{cb?.hotelStars ? `${cb.hotelStars}★` : '4★'}</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 3. Highlights / Features */}
        {!!cb?.highlights?.length && (
          <section className="mx-auto max-w-6xl px-6 py-12">
            <h2 className="text-2xl font-semibold md:text-3xl">Highlights</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {cb.highlights.slice(0, 8).map((h, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 bg-black/30 p-4 backdrop-blur-sm">
                  <div className="text-white/90">{h}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Travel Details */}
        <section className="bg-[hsl(200,85%,10%)]/40">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <h2 className="text-2xl font-semibold md:text-3xl">Travel Details</h2>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <h3 className="text-lg font-semibold">Dates</h3>
                {cb?.flexibleDates ? (
                  <div className="mt-2 text-white/80">Flexible Dates</div>
                ) : (
                  <ul className="mt-2 list-disc pl-5 text-white/80">
                    {(cb?.datesAvailable ?? []).map((d, i) => (<li key={i}>{d}</li>))}
                  </ul>
                )}
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <h3 className="text-lg font-semibold">Inclusions</h3>
                <ul className="mt-2 list-disc pl-5 text-white/80">
                  {(cb?.inclusions ?? ['Flights', 'Hotel', 'Guided Tour']).map((inc, i) => (<li key={i}>{inc}</li>))}
                </ul>
                {!!cb?.exclusions?.length && (
                  <>
                    <h4 className="mt-4 text-base font-semibold">Exclusions</h4>
                    <ul className="mt-1 list-disc pl-5 text-white/80">
                      {cb.exclusions.map((ex, i) => (<li key={i}>{ex}</li>))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 5. Accommodation */}
        {(cb?.hotelName || cb?.hotelGallery?.length) && (
          <section className="mx-auto max-w-6xl px-6 py-12">
            <h2 className="text-2xl font-semibold md:text-3xl">Accommodation</h2>
            <div className="mt-3 text-white/90">{cb?.hotelDescription ?? 'Comfortable, centrally located hotel options.'}</div>
            {!!cb?.hotelGallery?.length && (
              <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                {cb.hotelGallery.map((url, i) => (
                  <img key={i} src={url} alt={`Room ${i + 1}`} className="h-40 w-64 rounded-xl border object-cover" />
                ))}
              </div>
            )}
          </section>
        )}

        {/* 6. Price & Booking CTA */}
        <section className="bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10">
          <div className="mx-auto max-w-4xl px-6 py-14 text-center">
            <div className="text-2xl font-bold md:text-3xl">From £{Number(price).toLocaleString()} per person</div>
            {!!cb?.offerPrice && <Badge className="mt-3">Limited time offer</Badge>}
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button asChild size="lg" className="rounded-xl">
                <a href={`/book?serviceId=${id}`}>Enquire Now</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <a href="#faq">FAQ</a>
              </Button>
            </div>
          </div>
        </section>

        {/* 7. Gallery */}
        {!!cb?.gallery?.length && (
          <section className="mx-auto max-w-6xl px-6 py-12">
            <h2 className="text-2xl font-semibold md:text-3xl">Gallery</h2>
            <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
              {cb.gallery.map((url, i) => (
                <img key={i} src={url} alt={`Gallery ${i + 1}`} className="h-44 w-72 rounded-xl border object-cover" />
              ))}
            </div>
          </section>
        )}

        {/* 8. Testimonials */}
        {!!cb?.testimonials?.length && (
          <section className="mx-auto max-w-6xl px-6 py-12">
            <h2 className="text-2xl font-semibold md:text-3xl">Testimonials</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {cb.testimonials.slice(0, 3).map((t, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-black/30 p-5">
                  <div className="flex items-center gap-3">
                    {t.photoUrl ? <img src={t.photoUrl} alt={t.name} className="h-10 w-10 rounded-full" /> : <Images className="h-6 w-6 text-accent" />}
                    <div className="font-medium">{t.name}</div>
                  </div>
                  <p className="mt-3 text-white/90">“{t.quote}”</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 9. Related Packages */}
        {!!related.length && (
          <section className="mx-auto max-w-6xl px-6 py-12">
            <h2 className="text-2xl font-semibold md:text-3xl">Related Packages</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {related.slice(0, 4).map((r) => (
                <div key={r.id} className="overflow-hidden rounded-xl border border-white/10 bg-black/30">
                  <img src={r.imageUrl} alt={r.name || r.location} className="h-36 w-full object-cover" />
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{r.location}{r.country ? `, ${r.country}` : ''}</div>
                      <span className="text-sm">£{Number(r.offerPrice ?? r.price ?? 0)}</span>
                    </div>
                    <div className="mt-3">
                      <Button asChild variant="outline" className="rounded-lg">
                        <a href={`/city-break/${r.id}`}>View</a>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 10. FAQ */}
        {!!cb?.faq?.length && (
          <section id="faq" className="bg-[hsl(200,85%,10%)]/40">
            <div className="mx-auto max-w-4xl px-6 py-12">
              <h2 className="text-2xl font-semibold md:text-3xl">FAQ</h2>
              <Accordion type="single" collapsible className="mt-4">
                {cb.faq.map((f, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger>{f.question}</AccordionTrigger>
                    <AccordionContent>{f.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}

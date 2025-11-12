"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plane, Clock, Hotel, MapPin, Star } from "lucide-react";
type Svc = {
  id: string;
  category: string;
  title: string;
  description: string;
  price: number;
  offerPrice?: number;
  location: string;
  imageUrl: string;
}

export default function CityBreakPage() {
  // Sample content data — can be wired to CMS later
  const destinations = [
    { city: "Paris", country: "France", flag: "🇫🇷", price: 249, description: "Romance, art, and café culture.", image: "https://picsum.photos/seed/paris/1200/800" },
    { city: "Rome", country: "Italy", flag: "🇮🇹", price: 199, description: "History, pasta, and piazzas.", image: "https://picsum.photos/seed/rome/1200/800" },
    { city: "Barcelona", country: "Spain", flag: "🇪🇸", price: 229, description: "Gaudí, beaches, and tapas.", image: "https://picsum.photos/seed/barcelona/1200/800" },
    { city: "Amsterdam", country: "Netherlands", flag: "🇳🇱", price: 219, description: "Canals, bikes, and art.", image: "https://picsum.photos/seed/amsterdam/1200/800" },
    { city: "Prague", country: "Czechia", flag: "🇨🇿", price: 209, description: "Castles and cobblestone charm.", image: "https://picsum.photos/seed/prague/1200/800" },
    { city: "Lisbon", country: "Portugal", flag: "🇵🇹", price: 219, description: "Sun, trams, and fado.", image: "https://picsum.photos/seed/lisbon/1200/800" },
    { city: "Vienna", country: "Austria", flag: "🇦🇹", price: 239, description: "Opera and imperial elegance.", image: "https://picsum.photos/seed/vienna/1200/800" },
    { city: "Venice", country: "Italy", flag: "🇮🇹", price: 259, description: "Canals and timeless beauty.", image: "https://picsum.photos/seed/venice/1200/800" },
    { city: "Berlin", country: "Germany", flag: "🇩🇪", price: 229, description: "Culture, history, and nightlife.", image: "https://picsum.photos/seed/berlin/1200/800" }
  ];

  // Load live City Break services (fallback to sample content when empty)
  const [services, setServices] = useState<Svc[]>([])
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/services?category=City%20Break&limit=9', { cache: 'no-store' })
        const data: Svc[] = await res.json()
        if (!cancelled && Array.isArray(data)) setServices(data)
      } catch {}
    })()
    return () => { cancelled = true }
  }, [])

  const deals = [
    { title: "Paris in Winter", discount: "Save 15%", dates: "Dec–Feb", image: (services[0]?.imageUrl || destinations[0].image) },
    { title: "Amsterdam Lights", discount: "Save 10%", dates: "Nov–Jan", image: (services[3]?.imageUrl || destinations[3].image) },
    { title: "Rome Weekend", discount: "Save 12%", dates: "All Year", image: (services[1]?.imageUrl || destinations[1].image) },
    { title: "Barcelona Spring", discount: "Save 8%", dates: "Mar–May", image: (services[2]?.imageUrl || destinations[2].image) }
  ];

  const testimonials = [
    { name: "Emily, London", quote: "Our weekend in Rome was perfectly organized by Voyager Hub!", rating: 5, avatar: "https://picsum.photos/seed/citybreak-32/100/100" },
    { name: "Noah, Manchester", quote: "Barcelona in 3 days with flawless planning — loved it!", rating: 5, avatar: "https://picsum.photos/seed/citybreak-15/100/100" },
    { name: "Sofia, Bristol", quote: "Amsterdam canals and museums, handled end-to-end. Highly recommend.", rating: 5, avatar: "https://picsum.photos/seed/citybreak-5/100/100" }
  ];

  const carouselRef = useRef<HTMLDivElement>(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  // Simple auto-scroll for deals carousel
  useEffect(() => {
    const ref = carouselRef.current;
    if (!ref) return;
    let direction = 1;
    const id = setInterval(() => {
      ref.scrollBy({ left: 320 * direction, behavior: "smooth" });
      const atEnd = ref.scrollLeft + ref.clientWidth >= ref.scrollWidth - 4;
      const atStart = ref.scrollLeft <= 4;
      if (atEnd) direction = -1;
      if (atStart) direction = 1;
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Auto-cycle testimonials
  useEffect(() => {
    const id = setInterval(() => setTestimonialIndex((i) => (i + 1) % testimonials.length), 4000);
    return () => clearInterval(id);
  }, [testimonials.length]);

  // Compose items from live services or fallback destinations
  const items = services.length > 0
    ? services.map((s) => {
        const [city, country] = String(s.location || '').split(',').map((x) => x.trim())
        return { id: s.id, city: city || s.title, country: country || '', flag: '', price: s.offerPrice ?? s.price, description: s.description, image: s.imageUrl }
      })
    : destinations

  return (
    <div className="flex flex-col min-h-screen text-white">
      <Header />
      <main className="flex-1 pt-16">
        {/* 1. Hero Banner */}
        <section
          id="hero"
          className="relative -mt-16 h-[60vh] md:h-[70vh] lg:h-[75vh] w-full overflow-hidden"
          style={{
            backgroundImage: "url(https://picsum.photos/seed/paris-hero/2400/1200)",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative z-10 max-w-6xl mx-auto px-6 h-full flex flex-col items-center justify-center text-center">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl font-bold"
            >
              Discover Your Next City Break
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-3 md:mt-4 text-lg md:text-xl text-white/90"
            >
              Weekend escapes to Europe’s most exciting cities.
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-6">
              <Button asChild size="lg" className="rounded-xl">
                <Link href="#destinations">Explore Destinations</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* 2. Intro Section */}
        <section className="bg-white text-gray-900">
          <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold">What is a City Break?</h2>
              <p className="mt-3 text-gray-700">
                Short, curated getaways (2–5 days) to iconic destinations. We handle flights, stays, and insider tips — you just enjoy.
              </p>
              <p className="mt-3 text-gray-700">
                With flexible plans and handpicked hotels, Voyager Hub makes weekend escapes effortless.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center">
                <Clock className="h-8 w-8 text-primary" />
                <span className="mt-2 font-medium">Short Stays</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Plane className="h-8 w-8 text-primary" />
                <span className="mt-2 font-medium">Flexible Flights</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Hotel className="h-8 w-8 text-primary" />
                <span className="mt-2 font-medium">Quality Hotels</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Featured Destinations Grid */}
        <section id="destinations" className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-semibold">Featured Destinations</h2>
            <Link href="/services?category=City%20Break" className="text-primary hover:text-primary/80">View All</Link>
          </div>
          <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {items.map((d: any, idx: number) => (
              <div
                key={d.id ? `svc-${d.id}` : `dest-${d.city}-${d.country}-${idx}`}
                className="group overflow-hidden rounded-xl border border-white/10 bg-black/30 backdrop-blur-sm"
              >
                <div className="relative h-40 w-full">
                  {/* Using standard img for broad compatibility */}
                  <img src={d.image} alt={`${d.city} cityscape`} className="h-40 w-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{d.city} <span className="text-white/80">{d.flag}</span></h3>
                    <span className="text-sm text-white/80 flex items-center gap-1"><MapPin className="h-4 w-4" />{d.country}</span>
                  </div>
                  <p className="mt-2 text-white/80">{d.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-semibold">From £{d.price} pp</span>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" className="rounded-lg">
                        <Link href={d.id ? `/book?serviceId=${d.id}` : "/book"}>
                          View Details
                        </Link>
                      </Button>
                      <Button asChild className="rounded-lg">
                        <Link href={d.id ? `/book?serviceId=${d.id}` : "/book"}>
                          Enquire Now
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Limited-Time Deals / Offers */}
        <section className="bg-primary/10">
          <div className="max-w-6xl mx-auto px-6 py-10">
            <h2 className="text-2xl md:text-3xl font-semibold">Limited-Time Deals</h2>
            <div ref={carouselRef} className="mt-4 flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4" aria-label="City break deals carousel">
              {deals.map((o) => (
                <div key={o.title} className="snap-center shrink-0 w-[280px] rounded-xl overflow-hidden border border-white/10 bg-black/30">
                  <div className="relative h-36">
                    <img src={o.image} alt={o.title} className="h-36 w-full object-cover" loading="lazy" />
                    <div className="absolute top-2 left-2 bg-accent/80 text-white text-xs px-2 py-1 rounded">{o.discount}</div>
                  </div>
                  <div className="p-4">
                    <div className="font-semibold">{o.title}</div>
                    <div className="text-sm text-white/80">{o.dates}</div>
                    <div className="mt-3">
                      <Button asChild className="w-full rounded-lg">
                        <Link href="/book">Enquire</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Testimonials / Reviews */}
        <section className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="text-2xl md:text-3xl font-semibold">What Travellers Say</h2>
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: testimonialIndex === idx ? 1 : 0.7, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-xl border border-white/10 bg-black/30 p-5"
              >
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full" loading="lazy" />
                  <div className="font-medium">{t.name}</div>
                </div>
                <p className="mt-3 text-white/90">“{t.quote}”</p>
                <div className="mt-3 flex items-center gap-1 text-accent">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 6. Inquiry CTA Section */}
        <section id="cta" className="bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10">
          <div className="max-w-4xl mx-auto px-6 py-14 text-center">
            <h2 className="text-2xl md:text-3xl font-bold">Ready for your next city escape?</h2>
            <p className="mt-2 text-white/90">Our travel experts will plan everything for you.</p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button asChild size="lg" className="rounded-xl">
                <Link href="/ai-itinerary">Plan My Trip</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

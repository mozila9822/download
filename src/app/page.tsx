'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Plane, Hotel, Map, Bus, Bot, Zap, Globe, Headphones, Search, Calendar, CreditCard, MapPin, ShieldCheck, BadgeCheck, Lock } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useSettings } from '@/hooks/use-settings';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import SiteLayout from '@/components/site/SiteLayout';
import ServiceCard from '@/components/site/ServiceCard';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { services as allServices } from '@/lib/data';
import type { Service } from '@/lib/types';
import { useEffect, useState } from 'react';

const serviceIcons = [
  {
    icon: <Plane className="h-8 w-8 text-primary" />,
    title: 'Flights',
    description: 'Find the best deals on flights to your dream destinations.',
    href: '/services',
  },
  {
    icon: <Hotel className="h-8 w-8 text-primary" />,
    title: 'Hotels',
    description: 'A wide range of hotels to fit your budget and preferences.',
    href: '/services',
  },
  {
    icon: <Map className="h-8 w-8 text-primary" />,
    title: 'Tours',
    description: 'Unforgettable tours and experiences with local guides.',
    href: '/services',
  },
  {
    icon: <Bus className="h-8 w-8 text-primary" />,
    title: 'Coach Rides',
    description: 'Comfortable and convenient coach rides for city-to-city travel.',
    href: '/services',
  },
  {
    icon: <Map className="h-8 w-8 text-primary" />,
    title: 'Tourism',
    description: 'Curated travel experiences across iconic destinations.',
    href: '/services',
  },
  {
    icon: <Headphones className="h-8 w-8 text-primary" />,
    title: 'Travel e Support',
    description: '24/7 online assistance for bookings and itineraries.',
    href: '/ai-itinerary',
  },
];

const heroImage = PlaceHolderImages.find(
  (img) => img.id === 'hero-travel'
) ?? {
  imageUrl: 'https://picsum.photos/seed/1/1200/800',
  imageHint: 'tropical beach',
  description: 'Hero image',
};

export default function HomePage() {
  const [lastMinuteOffers, setLastMinuteOffers] = useState<Service[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [heroApi, setHeroApi] = useState<CarouselApi | null>(null);
  const { settings } = useSettings();
  const { scrollYProgress } = useScroll();
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  useEffect(() => {
    let cancelled = false;
    async function loadOffers() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/services?offerOnly=true&limit=3');
        if (!res.ok) throw new Error('Failed to load offers');
        const data: Service[] = await res.json();
        if (!cancelled) setLastMinuteOffers(data);
      } catch {
        if (!cancelled) setLastMinuteOffers((allServices || []).filter(s => !!s.offerPrice).slice(0, 3));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadOffers();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!heroApi) return;
    const id = setInterval(() => {
      heroApi.scrollNext();
    }, 5000);
    return () => clearInterval(id);
  }, [heroApi]);

  const featuredServices = (allServices || []).slice(0, 6);

  return (
    <SiteLayout>
      <main className="flex-1">
        <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center text-center text-white" aria-label="Hero">
          <Carousel className="absolute inset-0 -z-10" opts={{ loop: true }} setApi={setHeroApi}>
            <CarouselContent>
              {(settings?.theme?.heroImages && settings.theme.heroImages.length > 0
                ? settings.theme.heroImages
                : [
                    { url: 'https://picsum.photos/seed/hero-travel-mountain-lake/1080/720', hint: 'mountain lake', alt: 'A stunning mountain lake at sunset' },
                    { url: 'https://picsum.photos/seed/hero-travel-tropical-beach/1080/720', hint: 'tropical beach', alt: 'A serene tropical beach with palm trees' },
                    { url: 'https://picsum.photos/seed/hero-travel-city-night/1080/720', hint: 'city night skyline', alt: 'City skyline at night with lights' },
                    { url: 'https://picsum.photos/seed/hero-travel-desert-dunes/1080/720', hint: 'desert dunes', alt: 'Golden desert dunes under blue sky' },
                  ]
              ).map((img, i) => (
                <CarouselItem key={i} className="basis-full">
                  <div className="relative w-full h-[60vh] md:h-[80vh]">
                    <Image src={img.url} alt={img.alt || ''} fill className="object-cover brightness-50" priority={i === 0} data-ai-hint={img.hint || ''} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          {/* Subtle globe animation overlay with parallax */}
          <motion.svg
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25, rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            style={{ y: parallaxY }}
            viewBox="0 0 200 200"
            className="absolute w-[70%] md:w-[50%] max-w-[800px] h-auto"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="95" fill="url(#grad)" stroke="white" strokeOpacity="0.15" />
            {/* latitude lines */}
            {[...Array(6)].map((_, i) => (
              <circle key={i} cx="100" cy="100" r={20 + i * 12} stroke="white" strokeOpacity="0.1" fill="none" />
            ))}
            {/* longitude arcs */}
            {[...Array(6)].map((_, i) => (
              <path key={`arc-${i}`} d={`M 100 5 A 95 95 0 0 1 ${5 + i * 30} 100`} stroke="white" strokeOpacity="0.05" fill="none" />
            ))}
          </motion.svg>
          <div className="container px-4 md:px-6 animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-bold tracking-tight">
              Plan Your Journey
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-neutral-200">
              Curated destinations, luxury stays, and seamless bookings — all in one place.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="font-bold">
                <Link href="/services">
                  Explore Services <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" className="font-bold" variant="secondary">
                <Link href="/book">
                  Plan & Book Now <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold">
                <Link href="#featured">
                  Explore Opportunities <Globe className="ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="font-bold">
                <Link href="/ai-itinerary">
                  Plan with AI <Bot className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-16 md:py-24 bg-background" aria-label="Services and Offerings">
          <div className="container px-4 md:px-6">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">
                Our Services
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">
                We offer a comprehensive range of travel services to make your
                trip seamless and memorable.
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {serviceIcons.map((service) => (
                <Card
                  key={service.title}
                  className="text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
                >
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
                      {service.icon}
                    </div>
                    <CardTitle className="font-headline mt-4">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {service.description}
                    </p>
                    <Button asChild variant="link" className="mt-4 font-bold">
                      <Link href={service.href}>
                        Learn More <ArrowRight className="ml-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Destinations/Companies */}
        <section id="featured" className="py-16 md:py-24 bg-background" aria-label="Featured Destinations">
          <div className="container px-4 md:px-6">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h2 className="text-3xl md:text-4xl font-headline font-bold">Featured Destinations</h2>
                <p className="mt-2 text-muted-foreground md:text-lg">Handpicked places and partners you’ll love.</p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-5 h-5" />
                <span>Global reach</span>
              </div>
            </div>
            <div className="mt-10">
              <Carousel opts={{ align: 'start', loop: false }}>
                <CarouselContent>
                  {featuredServices.map((svc) => (
                    <CarouselItem key={svc.id} className="md:basis-1/2 lg:basis-1/3">
                      <ServiceCard service={svc} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious aria-label="Previous" />
                <CarouselNext aria-label="Next" />
              </Carousel>
            </div>
          </div>
        </section>

        {/* Last Minute Offers Section */}
        <section className="py-16 md:py-24 bg-background" aria-label="Last Minute Offers">
            <div className="container px-4 md:px-6">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-headline font-bold flex items-center justify-center gap-2">
                        <Zap className="w-8 h-8 text-accent" /> Last Minute Offers
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">
                        Grab these exclusive deals before they're gone! Limited time, limited slots.
                    </p>
                </div>
                <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isLoading && <p>Loading offers...</p>}
                    {lastMinuteOffers && lastMinuteOffers.map((offer) => (
                        <ServiceCard key={offer.id} service={offer} />
                    ))}
                </div>
                 <div className="text-center mt-12">
                    <Button asChild size="lg">
                        <Link href="/services">
                        View All Deals <ArrowRight className="ml-2" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24 bg-card" aria-label="How It Works">
          <div className="container px-4 md:px-6">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">How It Works</h2>
              <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">Book your next trip in four simple steps.</p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[{
                icon: <Search className="w-8 h-8 text-primary" />, title: 'Discover', desc: 'Browse curated destinations and services.'
              }, {
                icon: <Calendar className="w-8 h-8 text-primary" />, title: 'Plan', desc: 'Pick dates and tailor your itinerary.'
              }, {
                icon: <CreditCard className="w-8 h-8 text-primary" />, title: 'Book', desc: 'Secure checkout with transparent pricing.'
              }, {
                icon: <Headphones className="w-8 h-8 text-primary" />, title: 'Support', desc: 'Get 24/7 assistance along the way.'
              }].map((step, idx) => (
                <Card key={idx} className="transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">{step.icon}</div>
                    <CardTitle className="font-headline mt-4 text-center">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center">{step.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* AI Itinerary Section */}
        <section className="py-16 md:py-24 bg-card" aria-label="AI Itinerary">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-headline font-bold">
                  Get a Personalized Itinerary with AI
                </h2>
                <p className="mt-4 text-muted-foreground md:text-lg">
                  Not sure where to start? Let our intelligent travel assistant
                  craft a unique itinerary based on your preferences and travel
                  style.
                </p>
                <Button asChild size="lg" className="mt-8 font-bold">
                  <Link href="/ai-itinerary">
                    Create My Itinerary <Bot className="ml-2" />
                  </Link>
                </Button>
              </div>
              <div className="relative h-80 rounded-lg overflow-hidden shadow-lg">
                 <Image
                    src="https://picsum.photos/seed/2/600/400"
                    alt="AI Itinerary Planner"
                    fill
                    className="object-cover"
                    data-ai-hint="travel planning map"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-bold text-xl font-headline">Smart Travel Planning</h3>
                    <p>Tailored just for you.</p>
                  </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Voyager Hub */}
        <section className="py-16 md:py-24 bg-background" aria-label="Why Choose Voyager Hub">
          <div className="container px-4 md:px-6">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">Why Choose Voyager Hub</h2>
              <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">Trusted credentials, secure payments, and tailor-made luxury.</p>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="h-full">
                <CardHeader className="flex items-center gap-3"><ShieldCheck className="w-6 h-6" /><CardTitle className="font-headline text-lg">ATOL Protected</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Your holiday is protected under UK travel regulations.</p></CardContent>
              </Card>
              <Card className="h-full">
                <CardHeader className="flex items-center gap-3"><BadgeCheck className="w-6 h-6" /><CardTitle className="font-headline text-lg">ABTA Member</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Industry-standard assurance and service quality.</p></CardContent>
              </Card>
              <Card className="h-full">
                <CardHeader className="flex items-center gap-3"><Lock className="w-6 h-6" /><CardTitle className="font-headline text-lg">Secure Payments</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Pay with confidence via leading gateways.</p></CardContent>
              </Card>
              <Card className="h-full">
                <CardHeader className="flex items-center gap-3"><Map className="w-6 h-6" /><CardTitle className="font-headline text-lg">Tailored Luxury</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Personalised itineraries curated by experts.</p></CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 md:py-24 bg-background" aria-label="Testimonials">
          <div className="container px-4 md:px-6">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">What Our Clients Say</h2>
              <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">Real stories from travelers and partners.</p>
            </div>
            <div className="mt-10">
              <Carousel opts={{ align: 'start', loop: false }}>
                <CarouselContent>
                  {[
                    { name: 'Ava Brown', role: 'Traveler', quote: 'VoyagerHub made planning effortless. The hotel and tour were perfect!', img: 'https://picsum.photos/seed/ava/200/200' },
                    { name: 'Liam Johnson', role: 'Corporate Client', quote: 'Excellent support and seamless bookings for our team.', img: 'https://picsum.photos/seed/liam/200/200' },
                    { name: 'Noah Williams', role: 'Traveler', quote: 'Loved the Tokyo package. Great value and unforgettable experience.', img: 'https://picsum.photos/seed/noah/200/200' },
                    { name: 'Emma Jones', role: 'Partner', quote: 'Professional team with global reach. Strongly recommended.', img: 'https://picsum.photos/seed/emma/200/200' },
                  ].map((t, i) => (
                    <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                      <Card className="h-full">
                        <CardHeader className="flex flex-row items-center gap-4">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden">
                            <Image src={t.img} alt={t.name} fill className="object-cover" />
                          </div>
                          <div>
                            <CardTitle className="font-headline text-lg">{t.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{t.role}</p>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">“{t.quote}”</p>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious aria-label="Previous" />
                <CarouselNext aria-label="Next" />
              </Carousel>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10" aria-label="Call to Action">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Ready to Start Your Journey?</h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">Sign up or contact our team to plan your next adventure.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="font-bold">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="font-bold">
                <Link href="/profile">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}
        {/* Quick Access */}
        <section className="py-12 md:py-20 bg-background" aria-label="Quick Access">
          <div className="container px-4 md:px-6">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">Explore</h2>
              <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">Jump straight to our most popular sections.</p>
            </div>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                <CardHeader><CardTitle className="font-headline">Destinations</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Browse countries, regions and curated guides.</p>
                  <Button asChild variant="link" className="mt-3 font-bold"><Link href="/destinations">View Destinations <ArrowRight className="ml-1" /></Link></Button>
                </CardContent>
              </Card>
              <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                <CardHeader><CardTitle className="font-headline">Accommodation</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Luxury stays with flexible filters and live availability.</p>
                  <Button asChild variant="link" className="mt-3 font-bold"><Link href="/accommodation">View Accommodation <ArrowRight className="ml-1" /></Link></Button>
                </CardContent>
              </Card>
              <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                <CardHeader><CardTitle className="font-headline">Experiences</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Luxury escapes, adventure tours and city breaks.</p>
                  <Button asChild variant="link" className="mt-3 font-bold"><Link href="/experiences">View Experiences <ArrowRight className="ml-1" /></Link></Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Plane, Hotel, Map, Bus, Bot, Zap, Globe, Headphones, Search, Calendar, CreditCard, MapPin } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import SiteLayout from "@/components/site/SiteLayout";
import ServiceCard from "@/components/site/ServiceCard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { services as allServices } from "@/lib/data";
import { useEffect, useState } from "react";
import type { Service } from "@/lib/types";

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

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/services');
        const data: Service[] = await res.json();
        const offers = data.filter((s) => s.offerPrice != null).slice(0, 3);
        if (mounted) setLastMinuteOffers(offers);
      } catch (e) {
        console.error('Failed to load services for home offers', e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const featuredServices = (allServices || []).slice(0, 6);

  return (
    <SiteLayout>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center text-center text-white" aria-label="Hero">
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover -z-10 brightness-50"
            priority
            data-ai-hint={heroImage.imageHint}
          />
          {/* Subtle globe animation overlay */}
          <motion.svg
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25, rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
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
            {[...Array(6)].map((_, i) => (
              <circle key={i} cx="100" cy="100" r={20 + i * 12} stroke="white" strokeOpacity="0.1" fill="none" />
            ))}
            {[...Array(6)].map((_, i) => (
              <path key={`arc-${i}`} d={`M 100 5 A 95 95 0 0 1 ${5 + i * 30} 100`} stroke="white" strokeOpacity="0.05" fill="none" />
            ))}
          </motion.svg>
          <div className="container px-4 md:px-6 animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-bold tracking-tight">
              Your Adventure Awaits
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-neutral-200">
              Discover and book your next journey with VoyagerHub. Unforgettable
              experiences are just a click away.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="font-bold">
                <Link href="/services">
                  Explore Services <ArrowRight className="ml-2" />
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

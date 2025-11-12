"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Plane, Hotel, Map, Bus, Bot, Calendar, Sparkles } from "lucide-react";
import SiteLayout from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import SearchInputWithSuggestions from "@/components/site/SearchInputWithSuggestions";

export default function HomePage() {
  const [query, setQuery] = useState("");

  const categories = [
    { title: "Flights", href: "/flights", icon: <Plane className="h-8 w-8 text-primary" />, desc: "Best routes and fares worldwide." },
    { title: "Hotels", href: "/hotels", icon: <Hotel className="h-8 w-8 text-primary" />, desc: "Comfort stays across all budgets." },
    { title: "Tours", href: "/tours", icon: <Map className="h-8 w-8 text-primary" />, desc: "Handpicked experiences with local guides." },
    { title: "City Breaks", href: "/city-break", icon: <Calendar className="h-8 w-8 text-primary" />, desc: "Quick escapes, memorable weekends." },
    { title: "Coach Rides", href: "/coach-ride", icon: <Bus className="h-8 w-8 text-primary" />, desc: "Convenient intercity travel options." },
  ];

  return (
    <SiteLayout>
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-primary/60 to-accent/60" />
          {/* decorative glow */}
          <div className="absolute -top-10 -left-10 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.25),transparent_60%)] blur-2xl" />
          <div className="absolute -bottom-12 -right-12 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,148,0,0.25),transparent_60%)] blur-2xl" />
          <div className="relative z-10 p-8 md:p-12 text-white">
            <div className="text-center max-w-3xl mx-auto">
              <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-4xl md:text-6xl font-headline font-bold tracking-tight">
                Discover Your Next Journey
              </motion.h1>
              <p className="mt-4 text-white/80 md:text-lg">
                Book flights, hotels, tours, and city breaks — all in one place.
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-3 md:items-center">
                <SearchInputWithSuggestions
                  placeholder="Search destinations or services"
                  value={query}
                  onChange={setQuery}
                  className="bg-white/10 backdrop-blur text-white placeholder-white/70 border-white/20 focus-visible:ring-white/30"
                />
                <Button asChild size="lg" className="justify-center">
                  <Link href="/ai-itinerary">
                    Plan with AI <Bot className="ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="justify-center">
                  <Link href="/services">
                    Explore Services <ArrowRight className="ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Categories */}
        <section className="py-16 md:py-20" aria-label="Popular Categories">
          <div className="container">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">Popular Categories</h2>
              <p className="mt-3 text-muted-foreground md:text-lg">Find exactly what you need — fast.</p>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {categories.map((c) => (
                <Link key={c.title} href={c.href} className="group rounded-xl border border-white/10 bg-white/5 backdrop-blur p-6 transition hover:bg-white/10">
                  <div className="flex items-center gap-3">
                    {c.icon}
                    <span className="font-semibold">{c.title}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why VoyagerHub */}
        <section className="py-16 md:py-20" aria-label="Why VoyagerHub">
          <div className="container">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">Why VoyagerHub</h2>
              <p className="mt-3 text-muted-foreground md:text-lg">Smart planning, real savings, seamless booking.</p>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: <Sparkles className="h-6 w-6 text-primary" />, title: "Curated Experiences", desc: "Only the best tours and stays." },
                { icon: <Calendar className="h-6 w-6 text-primary" />, title: "Flexible Dates", desc: "Plan trips that fit your schedule." },
                { icon: <Plane className="h-6 w-6 text-primary" />, title: "Great Deals", desc: "Competitive fares and discounts." },
                { icon: <Bot className="h-6 w-6 text-primary" />, title: "AI Assistance", desc: "Personalized itineraries in seconds." },
              ].map((f) => (
                <div key={f.title} className="rounded-xl border bg-card p-6">
                  <div className="flex items-center gap-3">
                    {f.icon}
                    <span className="font-semibold">{f.title}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Button asChild size="lg">
                <Link href="/offers">Browse Last Minute Offers <ArrowRight className="ml-2" /></Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}

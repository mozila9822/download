"use client";
import SiteLayout from "@/components/site/SiteLayout";
import ServiceCard from "@/components/site/ServiceCard";
import SearchInputWithSuggestions from "@/components/site/SearchInputWithSuggestions";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Service } from "@/lib/types";

export default function LastOffersPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/services`);
        const data: Service[] = await res.json();
        if (!mounted) return;
        // Prefer discounted or last-minute flag if available
        const sorted = [...data].sort((a, b) => {
          const da = (a.discount ?? 0);
          const db = (b.discount ?? 0);
          return db - da;
        });
        setServices(sorted);
      } catch (e) {
        console.error("Failed to load services", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return services;
    const q = search.toLowerCase();
    return services.filter((s) => s.title.toLowerCase().includes(q) || s.location.toLowerCase().includes(q));
  }, [services, search]);

  return (
    <SiteLayout>
      <div className="container py-12 md:py-16">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-destructive/10 via-background to-primary/5">
          <div className="absolute inset-0 opacity-40 animate-pulse" />
          <div className="relative p-8 md:p-12">
            <div className="flex items-center gap-3">
              <Flame className="h-8 w-8 text-destructive" />
              <h1 className="text-3xl md:text-4xl font-headline font-bold">Last Minute Offers</h1>
            </div>
            <p className="mt-3 md:mt-4 text-muted-foreground md:text-lg">
              Hot deals expiring soon. Grab discounted city breaks, tours, hotels, flights and coach rides.
            </p>
            <div className="mt-6 flex gap-3">
              <Button onClick={() => window.scrollTo({ top: 9999, behavior: 'smooth' })}>Browse Deals</Button>
              <Button variant="outline" asChild>
                <a href="/services">Explore All Services</a>
              </Button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mt-8 flex gap-3">
          <SearchInputWithSuggestions
            placeholder="Search deals"
            value={search}
            onChange={setSearch}
            offerOnly
            onSelect={(s) => setSearch(s.title)}
          />
        </div>

        {/* Results */}
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading && Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
          ))}
          {!loading && filtered.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground">No offers found. Try searching different keywords.</div>
          )}
          {!loading && filtered.map((svc) => (
            <ServiceCard key={svc.id} service={svc} />
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}

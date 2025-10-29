"use client";
import SiteLayout from "@/components/site/SiteLayout";
import ServiceCard from "@/components/site/ServiceCard";
import SearchInputWithSuggestions from "@/components/site/SearchInputWithSuggestions";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Service } from "@/lib/types";

export default function HotelsPage() {
  const category = "Hotel";
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [sort, setSort] = useState<string>("price_asc");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/services?category=${encodeURIComponent(category)}`);
        const data: Service[] = await res.json();
        if (!mounted) return;
        setServices(data);
        const ceiling = Math.max(100, Math.ceil(Math.max(...(data.map((s) => s.price)), 0)));
        setMaxPrice(ceiling);
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
    let list = services.filter((s) => s.price <= maxPrice);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.title.toLowerCase().includes(q) || s.location.toLowerCase().includes(q));
    }
    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [services, search, maxPrice, sort]);

  return (
    <SiteLayout>
      <div className="container py-12 md:py-16">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-primary/10 via-background to-primary/5">
          <div className="absolute inset-0 opacity-40 animate-pulse" />
          <div className="relative p-8 md:p-12">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-headline font-bold">Hotels</h1>
            </div>
            <p className="mt-3 md:mt-4 text-muted-foreground md:text-lg">
              Stay in comfort. Filter by destination and compare nightly rates.
            </p>
            <div className="mt-6 flex gap-3">
              <Button onClick={() => window.scrollTo({ top: 9999, behavior: 'smooth' })}>Browse Now</Button>
              <Button variant="outline" asChild>
                <a href="/offers">See Last Offers</a>
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <SearchInputWithSuggestions
            placeholder="Search title or destination"
            value={search}
            onChange={setSearch}
            category="Hotel"
            onSelect={(s) => setSearch(s.title)}
          />
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Max Price</span>
            <Slider value={[maxPrice]} onValueChange={(v) => setMaxPrice(v[0])} min={0} max={Math.max(maxPrice, 100)} step={10} className="w-full" />
            <span className="text-sm font-medium">${maxPrice}</span>
          </div>
          <div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger><SelectValue placeholder="Sort" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading && Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
          ))}
          {!loading && filtered.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground">No hotels found. Try adjusting filters.</div>
          )}
          {!loading && filtered.map((svc) => (
            <ServiceCard key={svc.id} service={svc} />
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}

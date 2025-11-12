"use client";
import SiteLayout from "@/components/site/SiteLayout";
import Image from "next/image";
import ServiceCard from "@/components/site/ServiceCard";
import SearchInputWithSuggestions from "@/components/site/SearchInputWithSuggestions";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { MapPin, Map, Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Service } from "@/lib/types";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";

export default function ToursPage() {
  const category = "Tour";
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [sort, setSort] = useState<string>("price_asc");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [offerOnly, setOfferOnly] = useState<boolean>(false);

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
    if (offerOnly) {
      list = list.filter((s) => s.isOffer || typeof s.offerPrice === 'number');
    }
    if (dateRange?.from && dateRange?.to) {
      const from = dateRange.from;
      const to = dateRange.to;
      list = list.filter((s) => {
        if (!s.startDate || !s.endDate) return true;
        const start = new Date(s.startDate);
        const end = new Date(s.endDate);
        return start <= to && end >= from;
      });
    }
    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [services, search, maxPrice, sort, dateRange, offerOnly]);

  return (
    <SiteLayout>
      {/* Full-bleed hero (no borders, centered content) */}
      <section className="relative w-full min-h-[45vh] md:min-h-[55vh] flex items-center justify-center text-center">
        <Image
          src="https://picsum.photos/seed/tours-hero/2400/1200"
          alt="Guided tours hero"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 px-6">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3 justify-center">
              <Map className="h-8 w-8 text-white" />
              <h1 className="text-3xl md:text-4xl font-headline font-bold text-white">Guided Tours</h1>
            </div>
            <p className="mt-3 md:mt-4 text-white/90 md:text-lg">
              Explore must-see sights with local experts. Filter, compare, and book.
            </p>
            <div className="mt-6 flex gap-3 justify-center">
              <Button onClick={() => window.scrollTo({ top: 9999, behavior: 'smooth' })}>Browse Now</Button>
              <Button variant="outline" asChild>
                <a href="/offers">See Last Offers</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-12 md:py-16">
        {/* Filters */}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <SearchInputWithSuggestions
              placeholder="Search title or destination"
              value={search}
              onChange={setSearch}
              category="Tour"
              onSelect={(s) => setSearch(s.title)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Dates</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from && dateRange?.to ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}` : "Pick date range"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Max Price</span>
            <Slider value={[maxPrice]} onValueChange={(v) => setMaxPrice(v[0])} min={0} max={Math.max(maxPrice, 100)} step={10} className="w-full" />
            <span className="text-sm font-medium">£{maxPrice}</span>
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
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="offerOnly">Offers Only</Label>
            <Switch id="offerOnly" checked={offerOnly} onCheckedChange={setOfferOnly} />
          </div>
        </motion.div>

        {/* Results */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading && Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
          ))}
          {!loading && filtered.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground">No tours found. Try adjusting filters.</div>
          )}
          {!loading && filtered.map((svc) => (
            <motion.div key={svc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <ServiceCard service={svc} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </SiteLayout>
  );
}

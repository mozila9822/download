"use client";
import SiteLayout from "@/components/site/SiteLayout";
import ServiceCard from "@/components/site/ServiceCard";
import SearchInputWithSuggestions from "@/components/site/SearchInputWithSuggestions";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Bed } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Service } from "@/lib/types";
import { motion } from "framer-motion";
import { HeroBanner, InquiryCta } from "@/components/site/CityBreakTheme";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";

export default function HotelsPage() {
  const category = "Hotel";
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [sort, setSort] = useState<string>("price_asc");
  const [offerOnly, setOfferOnly] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  

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
  }, [services, search, maxPrice, sort, offerOnly, dateRange]);

  return (
    <SiteLayout>
      {/* Full-bleed City Break-style Hero */}
      <HeroBanner
        title="Stay in Comfort"
        subtitle="Curated hotels, flexible filters, and exclusive deals."
        imageUrl="https://picsum.photos/seed/hotels-hero/2400/1200"
        primaryLink={{ href: "#results", label: "Browse Hotels" }}
        secondaryLink={{ href: "/offers", label: "See Last Offers" }}
        heightClass="h-[60vh] md:h-[70vh] lg:h-[75vh]"
        fullBleed
        offsetHeader
        icon={
          <motion.div
            initial={{ rotate: -6, y: 0, scale: 1 }}
            animate={{ rotate: [-6, 6, -6], y: [0, -3, 0, 2, -1, 0], scale: [1, 1.06, 1.0, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
            aria-hidden
          >
            <Bed className="h-8 w-8 text-white drop-shadow" />
          </motion.div>
        }
      />

      <div className="container py-12 md:py-16">
        {/* Filters */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="mt-8 grid gap-4 md:grid-cols-3">
          <SearchInputWithSuggestions
            placeholder="Search title or destination"
            value={search}
            onChange={setSearch}
            category="Hotel"
            onSelect={(s) => setSearch(s.title)}
          />
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
        <motion.div id="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading && Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
          ))}
          {!loading && filtered.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground">No hotels found. Try adjusting filters.</div>
          )}
          {!loading && filtered.map((svc) => (
            <motion.div key={svc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <ServiceCard service={svc} />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <div className="mt-16">
          <InquiryCta
            title="Ready to book a hotel?"
            subtitle="Our team can help find the best stays and rates."
            primary={{ href: "/ai-itinerary", label: "Plan My Trip" }}
            secondary={{ href: "/contact", label: "Contact Us" }}
          />
        </div>
      </div>
    </SiteLayout>
  );
}
